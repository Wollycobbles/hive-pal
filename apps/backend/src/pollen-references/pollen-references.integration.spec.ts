import { INestApplication, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AdminPollenReferencesController } from './admin-pollen-references.controller';
import { PollenReferencesController } from './pollen-references.controller';
import { PollenReferencesService } from './pollen-references.service';
import { JwtAuthGuard, Role, RolesGuard } from '../auth/guards/jwt-auth.guard';

class MockJwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const roleHeader = request.headers['x-test-role'];

    request.user = {
      id: 'test-user',
      role: roleHeader === 'admin' ? Role.ADMIN : Role.USER,
    };

    return true;
  }
}

describe('PollenReferences endpoints', () => {
  let app: INestApplication;

  const service = {
    listActive: jest.fn(),
    listAllAdmin: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    activate: jest.fn(),
    deactivate: jest.fn(),
    remove: jest.fn(),
  } as unknown as PollenReferencesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PollenReferencesController, AdminPollenReferencesController],
      providers: [
        { provide: PollenReferencesService, useValue: service },
        RolesGuard,
        Reflector,
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useClass(MockJwtAuthGuard)
      .compile();

    app = module.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();

    jest.clearAllMocks();
  });

  afterEach(async () => {
    await app.close();
  });

  it('returns active records from the user endpoint', async () => {
    (service.listActive as jest.Mock).mockResolvedValue([
      { id: '1', plantName: 'Willow' },
    ]);

    await request(app.getHttpServer())
      .get('/api/pollen-references?scope=EUROPE&season=spring&colorGroup=yellow&search=willow')
      .set('x-test-role', 'user')
      .expect(200)
      .expect([{ id: '1', plantName: 'Willow' }]);

    expect(service.listActive).toHaveBeenCalledWith({
      region: 'EUROPE',
      season: ['spring'],
      colorGroup: 'yellow',
      search: 'willow',
    });
  });

  it('allows admin access and blocks non-admin access', async () => {
    (service.listAllAdmin as jest.Mock).mockResolvedValue([{ id: '1' }]);

    await request(app.getHttpServer())
      .get('/api/admin/pollen-references')
      .set('x-test-role', 'user')
      .expect(403);

    await request(app.getHttpServer())
      .get('/api/admin/pollen-references')
      .set('x-test-role', 'admin')
      .expect(200)
      .expect([{ id: '1' }]);
  });

  it('supports admin CRUD and activation endpoints', async () => {
    (service.create as jest.Mock).mockResolvedValue({ id: 'created' });
    (service.update as jest.Mock).mockResolvedValue({ id: 'updated' });
    (service.activate as jest.Mock).mockResolvedValue({ id: 'activated' });
    (service.deactivate as jest.Mock).mockResolvedValue({ id: 'deactivated' });
    (service.remove as jest.Mock).mockResolvedValue({ id: 'deleted' });

    await request(app.getHttpServer())
      .post('/api/admin/pollen-references')
      .set('x-test-role', 'admin')
      .send({
        plantName: 'Willow',
        scientificName: 'Salix spp.',
        colorLabel: 'pale yellow',
        colorGroup: 'yellow',
        hexColor: '#F4E66A',
        notes: null,
        active: true,
        regions: [
          { region: 'EUROPE', seasons: ['spring'], notes: null },
        ],
      })
      .expect(201)
      .expect({ id: 'created' });

    await request(app.getHttpServer())
      .patch('/api/admin/pollen-references/00000000-0000-4000-8000-000000000002')
      .set('x-test-role', 'admin')
      .send({
        id: '00000000-0000-4000-8000-000000000002',
        plantName: 'Willow',
      })
      .expect(200)
      .expect({ id: 'updated' });

    await request(app.getHttpServer())
      .patch('/api/admin/pollen-references/00000000-0000-4000-8000-000000000003/activate')
      .set('x-test-role', 'admin')
      .expect(200)
      .expect({ id: 'activated' });

    await request(app.getHttpServer())
      .patch('/api/admin/pollen-references/00000000-0000-4000-8000-000000000004/deactivate')
      .set('x-test-role', 'admin')
      .expect(200)
      .expect({ id: 'deactivated' });

    await request(app.getHttpServer())
      .delete('/api/admin/pollen-references/00000000-0000-4000-8000-000000000005')
      .set('x-test-role', 'admin')
      .expect(200)
      .expect({ id: 'deleted' });

    expect(service.create).toHaveBeenCalledTimes(1);
    expect(service.update).toHaveBeenCalledTimes(1);
    expect(service.activate).toHaveBeenCalledTimes(1);
    expect(service.deactivate).toHaveBeenCalledTimes(1);
    expect(service.remove).toHaveBeenCalledTimes(1);
  });

  it('does not expose import, export, or bulk workflows', async () => {
    await request(app.getHttpServer())
      .post('/api/admin/pollen-references/import')
      .set('x-test-role', 'admin')
      .expect(404);

    await request(app.getHttpServer())
      .get('/api/admin/pollen-references/export')
      .set('x-test-role', 'admin')
      .expect(404);

    await request(app.getHttpServer())
      .patch('/api/admin/pollen-references/bulk-update/extra')
      .set('x-test-role', 'admin')
      .expect(404);
  });
});
