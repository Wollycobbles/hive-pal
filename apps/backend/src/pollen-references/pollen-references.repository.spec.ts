import { PollenReferencesRepository } from './pollen-references.repository';
import { PrismaService } from '../prisma/prisma.service';

describe('PollenReferencesRepository', () => {
  const prisma = {
    pollenReference: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  } as unknown as PrismaService;

  let repository: PollenReferencesRepository;

  beforeEach(() => {
    repository = new PollenReferencesRepository(prisma);
    jest.clearAllMocks();
  });

  it('filters active records by region, season, color group, and search', async () => {
    await repository.findActive({
      region: 'EUROPE',
      season: ['spring', 'summer'],
      colorGroup: 'yellow',
      search: 'willow',
    });

    expect(prisma.pollenReference.findMany).toHaveBeenCalledWith({
      where: {
        active: true,
        colorGroup: { equals: 'yellow', mode: 'insensitive' },
        plantName: { contains: 'willow', mode: 'insensitive' },
        pollenReferenceRegions: {
          some: {
            region: 'EUROPE',
            seasons: {
              hasSome: ['SPRING', 'SUMMER'],
            },
          },
        },
      },
      include: {
        pollenReferenceRegions: {
          orderBy: { region: 'asc' },
        },
      },
      orderBy: [{ plantName: 'asc' }, { scientificName: 'asc' }],
    });
  });

  it('does not add region filters when scope is omitted', async () => {
    await repository.findActive({ search: 'clover' });

    expect(prisma.pollenReference.findMany).toHaveBeenCalledWith({
      where: {
        active: true,
        plantName: { contains: 'clover', mode: 'insensitive' },
      },
      include: {
        pollenReferenceRegions: {
          orderBy: { region: 'asc' },
        },
      },
      orderBy: [{ plantName: 'asc' }, { scientificName: 'asc' }],
    });
  });

  it('maps create payload seasons to Prisma enum values', async () => {
    await repository.create({
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
          seasons: ['spring', 'late-spring'],
          notes: null,
        },
      ],
    });

    expect(prisma.pollenReference.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          pollenReferenceRegions: {
            create: [
              expect.objectContaining({
                seasons: ['SPRING', 'LATE_SPRING'],
              }),
            ],
          },
        }),
      }),
    );
  });
});
