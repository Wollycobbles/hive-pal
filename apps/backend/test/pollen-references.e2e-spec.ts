import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { pollenSeasonMap } from '../src/utils/pollen-season-mappers';
import { getRandomUser } from './fixtures/user';
import { pollenReferenceSeedRecords } from '../prisma/pollen-reference.seed-data';

describe('Pollen references (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let userToken: string;
  let adminToken: string;
  const userEmail = 'pollen-reference-user@example.com';
  const adminEmail = 'pollen-reference-admin@example.com';
  const createdPollenReferenceIds: string[] = [];
  const createdUserIds: string[] = [];

  const createPollenReference = async (
    record: (typeof pollenReferenceSeedRecords)[number],
    active = record.active,
  ) => {
    const created = await prisma.pollenReference.create({
      data: {
        plantName: record.plantName,
        scientificName: record.scientificName,
        colorLabel: record.colorLabel,
        colorGroup: record.colorGroup,
        hexColor: record.hexColor,
        notes: record.notes,
        active,
        pollenReferenceRegions: {
          create: record.regions.map((region) => ({
            region: region.region,
            seasons: region.seasons.map((season) => pollenSeasonMap[season]),
            notes: region.notes,
          })),
        },
      },
    });

    createdPollenReferenceIds.push(created.id);
    return created;
  };

  const loginUser = async (email: string, password: string) => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email, password })
      .expect(201);

    return response.body.access_token as string;
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    app.setGlobalPrefix('api');
    await app.init();

    prisma = app.get(PrismaService);

    await prisma.pollenReference.deleteMany({
      where: {
        plantName: { in: ['Willow', 'Dandelion', 'Ivy', 'Foxglove'] },
      },
    });

    await prisma.user.deleteMany({
      where: { email: { in: [userEmail, adminEmail] } },
    });

    const user = await prisma.user.create({
      data: await getRandomUser({ email: userEmail, password: 'password123' }),
    });
    createdUserIds.push(user.id);

    const adminUser = await prisma.user.create({
      data: {
        ...(await getRandomUser({ email: adminEmail, password: 'password123' })),
        role: 'ADMIN',
      },
    });
    createdUserIds.push(adminUser.id);

    userToken = await loginUser(userEmail, 'password123');
    adminToken = await loginUser(adminEmail, 'password123');

    const willow = pollenReferenceSeedRecords.find(
      (record) => record.plantName === 'Willow',
    );
    const dandelion = pollenReferenceSeedRecords.find(
      (record) => record.plantName === 'Dandelion',
    );
    const ivy = pollenReferenceSeedRecords.find(
      (record) => record.plantName === 'Ivy',
    );

    if (!willow || !dandelion || !ivy) {
      throw new Error('Expected pollen reference seed records were not found');
    }

    await createPollenReference(willow, true);
    await createPollenReference(dandelion, true);
    await createPollenReference(ivy, true);
    await createPollenReference(
      {
        ...willow,
        plantName: 'Foxglove',
        colorGroup: 'red',
        colorLabel: 'deep red',
      },
      false,
    );
  });

  afterAll(async () => {
    await prisma.pollenReference.deleteMany({
      where: { id: { in: createdPollenReferenceIds } },
    });
    await prisma.user.deleteMany({
      where: { id: { in: createdUserIds } },
    });

    await app.close();
  });

  it('returns only active records for users and applies filters', async () => {
    await request(app.getHttpServer())
      .get('/api/pollen-references')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body).toHaveLength(3);
        expect(body.map((item: { plantName: string }) => item.plantName)).toEqual(
          expect.arrayContaining(['Willow', 'Dandelion', 'Ivy']),
        );
        expect(body.map((item: { plantName: string }) => item.plantName)).not.toContain(
          'Foxglove',
        );
      });

    await request(app.getHttpServer())
      .get('/api/pollen-references?scope=EUROPE&season=spring')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body).toHaveLength(2);
        expect(body.every((item: { regions: Array<{ region: string }> }) => item.regions.length === 1))
          .toBe(true);
        expect(body.every((item: { regions: Array<{ region: string }> }) => item.regions[0].region === 'EUROPE')).toBe(true);
      });

    await request(app.getHttpServer())
      .get('/api/pollen-references?colorGroup=orange&search=dandelion')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body).toHaveLength(1);
        expect(body[0].plantName).toBe('Dandelion');
      });

    await request(app.getHttpServer())
      .get('/api/pollen-references?scope=UK_AND_IRELAND&season=autumn&search=ivy')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body).toHaveLength(1);
        expect(body[0].plantName).toBe('Ivy');
      });
  });

  it('rejects invalid and duplicate admin payloads with 400', async () => {
    await request(app.getHttpServer())
      .post('/api/admin/pollen-references')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        plantName: '   ',
        scientificName: 'Salix spp.',
        colorLabel: '\t',
        colorGroup: 'yellow',
        hexColor: '#F4E66A',
        notes: null,
        active: true,
        regions: [
          {
            region: 'EUROPE',
            seasons: ['spring'],
            notes: null,
          },
        ],
      })
      .expect(400);

    await request(app.getHttpServer())
      .post('/api/admin/pollen-references')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        plantName: 'Duplicate region plant',
        scientificName: 'Salix spp.',
        colorLabel: 'pale yellow',
        colorGroup: 'yellow',
        hexColor: '#F4E66A',
        notes: null,
        active: true,
        regions: [
          {
            region: 'EUROPE',
            seasons: ['spring'],
            notes: null,
          },
          {
            region: 'EUROPE',
            seasons: ['summer'],
            notes: null,
          },
        ],
      })
      .expect(400);
  });

  it('blocks non-admin access and returns 404 for missing records', async () => {
    await request(app.getHttpServer())
      .get('/api/admin/pollen-references')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(403);

    await request(app.getHttpServer())
      .patch('/api/admin/pollen-references/00000000-0000-4000-8000-000000000099')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        id: '00000000-0000-4000-8000-000000000099',
        plantName: 'Missing',
      })
      .expect(404);
  });
});
