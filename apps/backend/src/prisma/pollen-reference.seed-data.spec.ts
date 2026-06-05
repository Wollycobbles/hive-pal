import {
  pollenReferenceAdminListItemSchema,
  pollenReferenceCreateSchema,
  pollenReferenceUserReadSchema,
} from '../../../../packages/shared-schemas/src/pollen';

import { pollenReferenceSeedRecords } from '../../prisma/pollen-reference.seed-data';

describe('pollenReferenceSeedRecords', () => {
  it('provides 100 unique pollen reference records', () => {
    expect(pollenReferenceSeedRecords).toHaveLength(100);

    const plantNames = new Set(
      pollenReferenceSeedRecords.map((record) => record.plantName),
    );
    const scientificNames = new Set(
      pollenReferenceSeedRecords.map((record) => record.scientificName),
    );

    expect(plantNames.size).toBe(100);
    expect(scientificNames.size).toBe(100);
    expect(pollenReferenceSeedRecords).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ plantName: 'Willow' }),
        expect.objectContaining({ plantName: 'Dandelion' }),
        expect.objectContaining({ plantName: 'White clover' }),
        expect.objectContaining({ plantName: 'Blackberry' }),
        expect.objectContaining({ plantName: 'Ivy' }),
      ]),
    );
  });

  it('matches the shared pollen create schema', () => {
    expect(
      pollenReferenceCreateSchema.parse(pollenReferenceSeedRecords[0]),
    ).toMatchObject({
      plantName: 'Willow',
      colorGroup: 'orange',
      active: true,
    });
  });

  it('provides a diverse pollen color palette', () => {
    const uniqueHexColors = new Set(
      pollenReferenceSeedRecords.map((record) => record.hexColor.toLowerCase()),
    );
    const uniqueColorGroups = new Set(
      pollenReferenceSeedRecords.map((record) => record.colorGroup),
    );

    expect(uniqueHexColors.size).toBeGreaterThanOrEqual(15);
    expect(uniqueColorGroups.size).toBeGreaterThanOrEqual(6);
  });

  it('covers both target regions with seasonal data for every plant', () => {
    for (const record of pollenReferenceSeedRecords) {
      expect(record.scientificName).toBeTruthy();
      expect(record.regions).toHaveLength(2);
      expect(record.regions.map((region) => region.region)).toEqual(
        expect.arrayContaining(['UK_AND_IRELAND', 'EUROPE']),
      );
      for (const region of record.regions) {
        expect(region.seasons.length).toBeGreaterThan(0);
      }
    }
  });

  it('assigns realistic seasons to representative forage plants', () => {
    const lookup = new Map(
      pollenReferenceSeedRecords.map((record) => [record.plantName, record]),
    );

    expect(lookup.get('Willow')?.regions).toEqual([
      {
        region: 'UK_AND_IRELAND',
        seasons: ['summer'],
        notes: null,
      },
      {
        region: 'EUROPE',
        seasons: ['spring', 'late-spring'],
        notes: null,
      },
    ]);

    expect(lookup.get('Dandelion')?.regions).toEqual([
      {
        region: 'UK_AND_IRELAND',
        seasons: ['spring'],
        notes: null,
      },
      {
        region: 'EUROPE',
        seasons: ['early-spring', 'spring'],
        notes: null,
      },
    ]);

    expect(lookup.get('White clover')?.regions).toEqual([
      {
        region: 'UK_AND_IRELAND',
        seasons: ['summer'],
        notes: null,
      },
      {
        region: 'EUROPE',
        seasons: ['spring', 'late-spring'],
        notes: null,
      },
    ]);

    expect(lookup.get('Blackberry')?.regions).toEqual([
      {
        region: 'UK_AND_IRELAND',
        seasons: ['summer'],
        notes: null,
      },
      {
        region: 'EUROPE',
        seasons: ['spring', 'late-spring'],
        notes: null,
      },
    ]);

    expect(lookup.get('Ivy')?.regions).toEqual([
      {
        region: 'UK_AND_IRELAND',
        seasons: ['autumn'],
        notes: null,
      },
      {
        region: 'EUROPE',
        seasons: ['late-summer', 'autumn'],
        notes: null,
      },
    ]);
  });

  it('does not include the previously duplicated alias records', () => {
    const plantNames = pollenReferenceSeedRecords.map((record) => record.plantName);

    expect(plantNames).not.toEqual(
      expect.arrayContaining(['Apple Blossom', 'Bramble', 'Clover', 'White Clover']),
    );
  });

  it('matches the user and admin read schemas', () => {
    const createdAt = '2026-06-04T12:00:00.000Z';
    const updatedAt = '2026-06-04T12:00:00.000Z';
    const baseRecord = pollenReferenceSeedRecords[0];

    expect(
      pollenReferenceUserReadSchema.parse({
        id: '00000000-0000-4000-8000-000000000001',
        plantName: baseRecord.plantName,
        scientificName: baseRecord.scientificName,
        colorLabel: baseRecord.colorLabel,
        colorGroup: baseRecord.colorGroup,
        hexColor: baseRecord.hexColor,
        notes: baseRecord.notes,
        regions: baseRecord.regions,
      }),
    ).toMatchObject({
      plantName: 'Willow',
    });

    expect(
      pollenReferenceAdminListItemSchema.parse({
        id: '00000000-0000-4000-8000-000000000001',
        plantName: baseRecord.plantName,
        scientificName: baseRecord.scientificName,
        colorLabel: baseRecord.colorLabel,
        colorGroup: baseRecord.colorGroup,
        hexColor: baseRecord.hexColor,
        notes: baseRecord.notes,
        active: baseRecord.active,
        createdAt,
        updatedAt,
        regions: baseRecord.regions,
      }),
    ).toMatchObject({
      active: true,
      createdAt,
    });
  });
});
