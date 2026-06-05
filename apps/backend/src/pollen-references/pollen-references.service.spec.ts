import { PollenReferencesService } from './pollen-references.service';
import { PollenReferencesRepository } from './pollen-references.repository';

describe('PollenReferencesService', () => {
  const repository = {
    findActive: jest.fn(),
    findAllAdmin: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    setActive: jest.fn(),
    remove: jest.fn(),
  } as unknown as PollenReferencesRepository;

  let service: PollenReferencesService;

  const record = {
    id: '00000000-0000-4000-8000-000000000001',
    plantName: 'Willow',
      scientificName: 'Salix spp.',
      colorLabel: 'pale yellow',
      colorGroup: 'yellow',
      hexColor: '#F4E66A',
      notes: null,
      active: true,
      createdAt: new Date('2026-06-04T12:00:00.000Z'),
      updatedAt: new Date('2026-06-04T12:00:00.000Z'),
      pollenReferenceRegions: [
        {
          region: 'UK_AND_IRELAND',
          seasons: ['SUMMER'],
          notes: null,
        },
        {
          region: 'EUROPE',
          seasons: ['SPRING', 'LATE_SPRING'],
          notes: null,
        },
      ],
  };

  beforeEach(() => {
    service = new PollenReferencesService(repository);
    jest.clearAllMocks();
  });

  it('returns only the selected scope region for user reads', async () => {
    (repository.findActive as jest.Mock).mockResolvedValue([record]);

    await expect(
      service.listActive({
        region: 'EUROPE',
        season: ['spring'],
        colorGroup: 'yellow',
        search: 'willow',
      }),
    ).resolves.toEqual([
      {
        id: record.id,
        plantName: record.plantName,
        scientificName: record.scientificName,
        colorLabel: record.colorLabel,
        colorGroup: record.colorGroup,
        hexColor: record.hexColor,
        notes: record.notes,
          regions: [
            {
              region: 'EUROPE',
              seasons: ['spring', 'late-spring'],
              notes: null,
            },
          ],
      },
    ]);
  });

  it('maps admin list records with timestamps and active state', async () => {
    (repository.findAllAdmin as jest.Mock).mockResolvedValue([record]);

    await expect(service.listAllAdmin()).resolves.toEqual([
      expect.objectContaining({
        active: true,
        createdAt: '2026-06-04T12:00:00.000Z',
        updatedAt: '2026-06-04T12:00:00.000Z',
      }),
    ]);
  });

  it('passes create payloads through to the repository', async () => {
    (repository.create as jest.Mock).mockResolvedValue(record);

    await service.create({
      plantName: 'Willow',
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
      ],
    });

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        plantName: 'Willow',
        regions: [
          {
            region: 'EUROPE',
            seasons: ['spring'],
            notes: null,
          },
        ],
      }),
    );
  });

  it('supports activation and deactivation', async () => {
    (repository.setActive as jest.Mock).mockResolvedValue(record);

    await service.activate(record.id);
    await service.deactivate(record.id);

    expect(repository.setActive).toHaveBeenNthCalledWith(1, record.id, true);
    expect(repository.setActive).toHaveBeenNthCalledWith(2, record.id, false);
  });
});
