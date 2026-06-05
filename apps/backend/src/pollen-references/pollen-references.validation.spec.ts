import {
  pollenReferenceCreateSchema,
  pollenReferenceUpdateSchema,
} from 'shared-schemas';

describe('pollen references validation', () => {
  const validPayload = {
    plantName: 'Willow',
    scientificName: 'Salix spp.',
    colorLabel: 'pale yellow',
    colorGroup: 'yellow',
    hexColor: '#F4E66A',
    notes: null,
    regions: [
      {
        region: 'UK_AND_IRELAND' as const,
        seasons: ['early-spring', 'spring'] as const,
        notes: null,
      },
    ],
  };

  it('rejects whitespace-only required fields', () => {
    expect(() =>
      pollenReferenceCreateSchema.parse({
        ...validPayload,
        plantName: '   ',
        colorLabel: '\t',
      }),
    ).toThrow();
  });

  it('trims required string fields', () => {
    expect(
      pollenReferenceCreateSchema.parse({
        ...validPayload,
        plantName: ' Willow ',
        colorLabel: ' pale yellow ',
      }),
    ).toMatchObject({
      plantName: 'Willow',
      colorLabel: 'pale yellow',
    });
  });

  it('rejects invalid color groups', () => {
    expect(() =>
      pollenReferenceCreateSchema.parse({
        ...validPayload,
        colorGroup: 'purple',
      }),
    ).toThrow();
  });

  it('rejects duplicate region mappings', () => {
    expect(() =>
      pollenReferenceCreateSchema.parse({
        ...validPayload,
        regions: [
          validPayload.regions[0],
          {
            region: 'UK_AND_IRELAND' as const,
            seasons: ['summer'] as const,
            notes: null,
          },
        ],
      }),
    ).toThrow('Duplicate region mapping: UK_AND_IRELAND');
  });

  it('rejects duplicate region mappings on update payloads', () => {
    expect(() =>
      pollenReferenceUpdateSchema.parse({
        id: '00000000-0000-4000-8000-000000000001',
        regions: [
          {
            region: 'EUROPE' as const,
            seasons: ['spring'] as const,
            notes: null,
          },
          {
            region: 'EUROPE' as const,
            seasons: ['summer'] as const,
            notes: null,
          },
        ],
      }),
    ).toThrow('Duplicate region mapping: EUROPE');
  });
});
