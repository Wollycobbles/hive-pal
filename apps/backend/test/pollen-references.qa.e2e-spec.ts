import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { pollenSeasonMap } from '../src/utils/pollen-season-mappers';
import { getRandomUser } from './fixtures/user';

type SeedRecord = {
  plantName: string;
  scientificName: string | null;
  colorLabel: string;
  colorGroup: string;
  hexColor: string;
  notes: string | null;
  active: boolean;
  regions: Array<{
    region: string;
    seasons: string[];
    notes: string | null;
  }>;
};

describe('Pollen references QA (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let userToken: string;
  let adminToken: string;
  const userEmail = 'pollen-qa-user@example.com';
  const adminEmail = 'pollen-qa-admin@example.com';
  const createdUserIds: string[] = [];

  const loginUser = async (email: string, password: string) => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email, password })
      .expect(201);

    return response.body.access_token as string;
  };

  const createPollenReference = async (record: SeedRecord) => {
    return prisma.pollenReference.create({
      data: {
        plantName: record.plantName,
        scientificName: record.scientificName,
        colorLabel: record.colorLabel,
        colorGroup: record.colorGroup,
        hexColor: record.hexColor,
        notes: record.notes,
        active: record.active,
        pollenReferenceRegions: {
          create: record.regions.map((region) => ({
            region: region.region as never,
            seasons: region.seasons.map((season) => pollenSeasonMap[season]),
            notes: region.notes,
          })),
        },
      },
    });
  };

  const seedLookupFixtures = async () => {
    await Promise.all([
      createPollenReference({
        plantName: 'Willow',
        scientificName: 'Salix spp.',
        colorLabel: 'orange amber',
        colorGroup: 'orange',
        hexColor: '#F1911C',
        notes: 'Early source',
        active: true,
        regions: [
          { region: 'EUROPE', seasons: ['spring'], notes: 'EU spring' },
          { region: 'UK_AND_IRELAND', seasons: ['early-spring', 'spring'], notes: 'UK early' },
        ],
      }),
      createPollenReference({
        plantName: 'Dandelion',
        scientificName: 'Taraxacum officinale',
        colorLabel: 'bright yellow',
        colorGroup: 'yellow',
        hexColor: '#F8C900',
        notes: null,
        active: true,
        regions: [
          { region: 'EUROPE', seasons: ['spring', 'summer'], notes: null },
        ],
      }),
      createPollenReference({
        plantName: 'Ivy',
        scientificName: 'Hedera helix',
        colorLabel: 'golden yellow',
        colorGroup: 'yellow',
        hexColor: '#FEA722',
        notes: null,
        active: true,
        regions: [
          { region: 'UK_AND_IRELAND', seasons: ['autumn'], notes: 'Autumn forage' },
          { region: 'EUROPE', seasons: ['autumn'], notes: null },
        ],
      }),
      createPollenReference({
        plantName: 'Foxglove',
        scientificName: 'Digitalis purpurea',
        colorLabel: 'deep red',
        colorGroup: 'red',
        hexColor: '#7B2028',
        notes: null,
        active: false,
        regions: [{ region: 'EUROPE', seasons: ['summer'], notes: null }],
      }),
    ]);
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

    await prisma.user.deleteMany({
      where: { email: { in: [userEmail, adminEmail] } },
    });

    const user = await prisma.user.create({
      data: await getRandomUser({ email: userEmail, password: 'password123' }),
    });
    const adminUser = await prisma.user.create({
      data: {
        ...(await getRandomUser({ email: adminEmail, password: 'password123' })),
        role: 'ADMIN',
      },
    });

    createdUserIds.push(user.id, adminUser.id);
    userToken = await loginUser(userEmail, 'password123');
    adminToken = await loginUser(adminEmail, 'password123');
  });

  beforeEach(async () => {
    await prisma.pollenReferenceRegion.deleteMany();
    await prisma.pollenReference.deleteMany();
  });

  afterAll(async () => {
    await prisma.pollenReferenceRegion.deleteMany();
    await prisma.pollenReference.deleteMany();
    await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    await app.close();
  });

  it('covers user-facing acceptance criteria for active records, filters, and response shape', async () => {
    await seedLookupFixtures();

    const listAll = await request(app.getHttpServer())
      .get('/api/pollen-references')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(listAll.body).toHaveLength(3);
    expect(listAll.body.map((item: { plantName: string }) => item.plantName)).toEqual([
      'Dandelion',
      'Ivy',
      'Willow',
    ]);
    expect(listAll.body.some((item: { plantName: string }) => item.plantName === 'Foxglove')).toBe(false);
    expect(listAll.body[0]).toHaveProperty('id');
    expect(listAll.body[0]).toHaveProperty('plantName');
    expect(listAll.body[0]).toHaveProperty('scientificName');
    expect(listAll.body[0]).toHaveProperty('colorLabel');
    expect(listAll.body[0]).toHaveProperty('colorGroup');
    expect(listAll.body[0]).toHaveProperty('hexColor');
    expect(listAll.body[0]).toHaveProperty('notes');
    expect(listAll.body[0]).toHaveProperty('regions');

    const europeSpring = await request(app.getHttpServer())
      .get('/api/pollen-references?scope=EUROPE&season=spring')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(europeSpring.body.map((item: { plantName: string }) => item.plantName)).toEqual([
      'Dandelion',
      'Willow',
    ]);
    expect(
      europeSpring.body.every(
        (item: { regions: Array<{ region: string; seasons: string[] }> }) =>
          item.regions.length === 1 &&
          item.regions[0].region === 'EUROPE' &&
          item.regions[0].seasons.some((season) => season === 'spring'),
      ),
    ).toBe(true);

    await request(app.getHttpServer())
      .get('/api/pollen-references?colorGroup=orange')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body).toHaveLength(1);
        expect(body[0].plantName).toBe('Willow');
      });

    await request(app.getHttpServer())
      .get('/api/pollen-references?search=dandelion')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body).toHaveLength(1);
        expect(body[0].plantName).toBe('Dandelion');
      });

    const combined = await request(app.getHttpServer())
      .get('/api/pollen-references?scope=UK_AND_IRELAND&season=autumn&colorGroup=yellow&search=ivy')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(combined.body).toHaveLength(1);
    expect(combined.body[0].plantName).toBe('Ivy');
    expect(combined.body[0].regions).toEqual([
      {
        region: 'UK_AND_IRELAND',
        seasons: ['autumn'],
        notes: 'Autumn forage',
      },
    ]);
  });

  it('covers admin acceptance criteria for auth, list, create, update, activate, deactivate, and delete', async () => {
    await seedLookupFixtures();

    await request(app.getHttpServer()).get('/api/admin/pollen-references').expect(401);

    await request(app.getHttpServer())
      .get('/api/admin/pollen-references')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(403);

    const adminList = await request(app.getHttpServer())
      .get('/api/admin/pollen-references')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(adminList.body).toHaveLength(4);
    expect(adminList.body.some((item: { active: boolean }) => item.active === false)).toBe(true);

    const createResponse = await request(app.getHttpServer())
      .post('/api/admin/pollen-references')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        plantName: 'Heather',
        scientificName: 'Calluna vulgaris',
        colorLabel: 'warm brown',
        colorGroup: 'brown',
        hexColor: '#A07234',
        notes: 'Late season source',
        active: true,
        regions: [
          { region: 'UK_AND_IRELAND', seasons: ['late-summer', 'autumn'], notes: 'Moorland' },
          { region: 'EUROPE', seasons: ['late-summer'], notes: null },
        ],
      })
      .expect(201);

    expect(createResponse.body).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        plantName: 'Heather',
        active: true,
        regions: expect.arrayContaining([
          expect.objectContaining({ region: 'UK_AND_IRELAND' }),
          expect.objectContaining({ region: 'EUROPE' }),
        ]),
      }),
    );

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
        regions: [{ region: 'EUROPE', seasons: ['spring'], notes: null }],
      })
      .expect(400)
      .expect(({ body }) => {
        expect(body.message).toContain('plantName');
        expect(body.message).toContain('colorLabel');
      });

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
          { region: 'EUROPE', seasons: ['spring'], notes: null },
          { region: 'EUROPE', seasons: ['summer'], notes: null },
        ],
      })
      .expect(400)
      .expect(({ body }) => {
        expect(body.message).toContain('Duplicate region mapping: EUROPE');
      });

    await request(app.getHttpServer())
      .post('/api/admin/pollen-references')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        plantName: 'Invalid color plant',
        scientificName: null,
        colorLabel: 'neon magenta',
        colorGroup: 'magenta',
        hexColor: '#FF00FF',
        notes: null,
        active: true,
        regions: [{ region: 'EUROPE', seasons: ['spring'], notes: null }],
      })
      .expect(400)
      .expect(({ body }) => {
        expect(body.message).toContain('colorGroup');
      });

    const updated = await request(app.getHttpServer())
      .patch(`/api/admin/pollen-references/${createResponse.body.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        id: createResponse.body.id,
        plantName: 'Ling Heather',
        colorGroup: 'red',
        colorLabel: 'rust red',
        hexColor: '#BF453B',
        regions: [{ region: 'EUROPE', seasons: ['autumn'], notes: 'Updated region mapping' }],
      })
      .expect(200);

    expect(updated.body.plantName).toBe('Ling Heather');
    expect(updated.body.colorGroup).toBe('red');
    expect(updated.body.regions).toEqual([
      {
        region: 'EUROPE',
        seasons: ['autumn'],
        notes: 'Updated region mapping',
      },
    ]);

    await request(app.getHttpServer())
      .patch(`/api/admin/pollen-references/${createResponse.body.id}/deactivate`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body.active).toBe(false);
      });

    await request(app.getHttpServer())
      .patch(`/api/admin/pollen-references/${createResponse.body.id}/activate`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body.active).toBe(true);
      });

    await request(app.getHttpServer())
      .delete(`/api/admin/pollen-references/${createResponse.body.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    const listAfterDelete = await request(app.getHttpServer())
      .get('/api/admin/pollen-references')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(
      listAfterDelete.body.some((item: { id: string }) => item.id === createResponse.body.id),
    ).toBe(false);
  });

  it('explores invalid inputs, duplicate names, SQL-like search input, and missing records', async () => {
    await seedLookupFixtures();

    await request(app.getHttpServer())
      .get('/api/pollen-references?region=NOT_A_REGION')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(400);

    await request(app.getHttpServer())
      .get('/api/pollen-references?season=winter')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(400);

    await request(app.getHttpServer())
      .get('/api/pollen-references?colorGroup=purple')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(400);

    await request(app.getHttpServer())
      .get('/api/pollen-references?search=')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(400);

    const emptySeason = await request(app.getHttpServer())
      .get('/api/pollen-references?season=')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(emptySeason.body).toHaveLength(3);

    await request(app.getHttpServer())
      .get('/api/pollen-references?search=%27%20OR%201%3D1%20--')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body).toEqual([]);
      });

    const firstDuplicate = await request(app.getHttpServer())
      .post('/api/admin/pollen-references')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        plantName: 'Duplicate Name Plant',
        scientificName: 'Specimen one',
        colorLabel: 'cream',
        colorGroup: 'cream',
        hexColor: '#E8D8A2',
        notes: null,
        active: true,
        regions: [{ region: 'EUROPE', seasons: ['spring'], notes: null }],
      })
      .expect(201);

    const secondDuplicate = await request(app.getHttpServer())
      .post('/api/admin/pollen-references')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        plantName: 'Duplicate Name Plant',
        scientificName: 'Specimen two',
        colorLabel: 'olive green',
        colorGroup: 'green',
        hexColor: '#8A9B50',
        notes: null,
        active: true,
        regions: [{ region: 'UK_AND_IRELAND', seasons: ['summer'], notes: null }],
      })
      .expect(201);

    expect(firstDuplicate.body.id).not.toBe(secondDuplicate.body.id);

    await request(app.getHttpServer())
      .patch('/api/admin/pollen-references/00000000-0000-4000-8000-000000000099')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        id: '00000000-0000-4000-8000-000000000099',
        plantName: 'Missing',
      })
      .expect(404)
      .expect(({ body }) => {
        expect(body.message).toContain('not found');
      });
  });

  it('returns quickly with 100 records and shows no rate limiting on repeated reads', async () => {
    const bulkRecords: SeedRecord[] = Array.from({ length: 100 }, (_, index) => ({
      plantName: `Performance Plant ${index.toString().padStart(3, '0')}`,
      scientificName: null,
      colorLabel: 'bright yellow',
      colorGroup: index % 2 === 0 ? 'yellow' : 'orange',
      hexColor: '#F8C900',
      notes: null,
      active: true,
      regions: [
        {
          region: index % 3 === 0 ? 'EUROPE' : 'UK_AND_IRELAND',
          seasons: index % 2 === 0 ? ['spring'] : ['summer'],
          notes: null,
        },
      ],
    }));

    await Promise.all(bulkRecords.map((record) => createPollenReference(record)));

    const startedAt = Date.now();
    const response = await request(app.getHttpServer())
      .get('/api/pollen-references?season=spring')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);
    const durationMs = Date.now() - startedAt;

    expect(response.body.length).toBe(50);
    expect(durationMs).toBeLessThan(1500);

    for (let attempt = 0; attempt < 20; attempt += 1) {
      await request(app.getHttpServer())
        .get('/api/pollen-references')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);
    }
  });
});
