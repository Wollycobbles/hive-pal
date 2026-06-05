import { PrismaPg } from '@prisma/adapter-pg';
import { pollenReferenceSeedRecords } from './pollen-reference.seed-data';
import { resetPollenReferenceSeedData } from './seed-helpers';
import { pollenSeasonMap } from '../src/utils/pollen-season-mappers';

const moduleLoader = require('module') as {
  _resolveFilename: (
    request: string,
    parent: { filename?: string } | null,
    isMain: boolean,
    options?: unknown,
  ) => string;
};

const originalResolveFilename = moduleLoader._resolveFilename.bind(moduleLoader);

moduleLoader._resolveFilename = (
  request,
  parent,
  isMain,
  options,
) => {
  if (
    request.endsWith('.js') &&
    parent?.filename?.includes('/src/generated/prisma/')
  ) {
    const candidate = request.replace(/\.js$/, '.ts');

    try {
      return originalResolveFilename(candidate, parent, isMain, options);
    } catch {
      // Fall through to the original request if the TypeScript source is absent.
    }
  }

  return originalResolveFilename(request, parent, isMain, options);
};

const { PrismaClient } = require('../src/generated/prisma/client');

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  await resetPollenReferenceSeedData(prisma);

  const user = await prisma.user.upsert({
    where: {
      email: 'test@test.com',
    },
    update: {
      password: 'password',
      name: 'Test User',
    },
    create: {
      email: 'test@test.com',
      password: 'password',
      name: 'Test User',
    },
  });

  // Create apiaries
  const homeApiary =
    (await prisma.apiary.findFirst({
      where: {
        name: 'Home Apiary',
        userId: user.id,
      },
    })) ??
    (await prisma.apiary.create({
      data: {
        name: 'Home Apiary',
        latitude: 42.3601,
        longitude: -71.0589,
        userId: user.id,
      },
    }));

  // Create hives
  const hive1 =
    (await prisma.hive.findFirst({
      where: {
        name: 'Hive 01',
        apiaryId: homeApiary.id,
      },
    })) ??
    (await prisma.hive.create({
      data: {
        name: 'Hive 01',
        apiaryId: homeApiary.id,
        status: 'ACTIVE',
        installationDate: new Date('2025-01-15'),
      },
    }));

  // Create queens
  const existingQueen = await prisma.queen.findFirst({
    where: {
      hiveId: hive1.id,
      color: 'RED',
      source: 'Local breeder',
      status: 'ACTIVE',
    },
  });

  if (!existingQueen) {
    await prisma.queen.create({
      data: {
        hiveId: hive1.id,
        color: 'RED',
        source: 'Local breeder',
        status: 'ACTIVE',
        installedAt: new Date('2025-01-15'),
      },
    });
  }

  // Create inspections
  const existingInspection = await prisma.inspection.findFirst({
    where: {
      hiveId: hive1.id,
      date: new Date('2025-02-01'),
    },
  });

  if (!existingInspection) {
    await prisma.inspection.create({
      data: {
        hiveId: hive1.id,
        date: new Date('2025-02-01'),
        weatherConditions: 'Sunny',
        observations: {
          createMany: {
            data: [
              {
                type: 'BROOD_COUNT',
                numericValue: 5,
                notes: 'Healthy brood pattern',
              },
              {
                type: 'QUEEN_SEEN',
                numericValue: 1,
                notes: 'Queen spotted',
              },
            ],
          },
        },
      },
    });
  }

  await prisma.$transaction(
    pollenReferenceSeedRecords.map((record) =>
      prisma.pollenReference.create({
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
              region: region.region,
              seasons: region.seasons.map((season) => pollenSeasonMap[season]),
              notes: region.notes,
            })),
          },
        },
      }),
    ),
  );

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma
      .$disconnect()
      .then(() => process.exit())
      .catch(() => process.exit(1));
  });
