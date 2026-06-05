import { PrismaPg } from '@prisma/adapter-pg';
import { pollenReferenceSeedRecords } from './pollen-reference.seed-data';
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

/**
 * Bootstrap pollen reference data for production deployment.
 * This script is safe to run multiple times - it checks if data exists first.
 */
async function main() {
  console.log('Checking if pollen reference data needs bootstrapping...');

  // Check if pollen data already exists
  const existingCount = await prisma.pollenReference.count();
  
  if (existingCount > 0) {
    console.log(`Pollen reference data already exists (${existingCount} records). Skipping bootstrap.`);
    return;
  }

  console.log('Bootstrapping pollen reference data...');

  // Insert all pollen reference records in a transaction
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

  const finalCount = await prisma.pollenReference.count();
  console.log(`Successfully bootstrapped ${finalCount} pollen reference records.`);
}

main()
  .catch((e) => {
    console.error('Error bootstrapping pollen reference data:', e);
    process.exit(1);
  })
  .finally(() => {
    prisma
      .$disconnect()
      .then(() => process.exit())
      .catch(() => process.exit(1));
  });
