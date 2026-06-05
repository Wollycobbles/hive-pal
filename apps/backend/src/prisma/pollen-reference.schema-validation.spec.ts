import {
  pollenReferenceCreateSchema,
  pollenReferenceUpdateSchema,
} from '../../../../packages/shared-schemas/src/pollen';

describe('pollen reference shared schemas', () => {
  const validCreatePayload = {
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

  it('defaults active to true for create payloads', () => {
    expect(pollenReferenceCreateSchema.parse(validCreatePayload)).toMatchObject({
      active: true,
    });
  });

  it('rejects invalid hex colours', () => {
    expect(() =>
      pollenReferenceCreateSchema.parse({
        ...validCreatePayload,
        hexColor: 'yellow',
      }),
    ).toThrow('Must be a valid hex colour');
  });

  it('rejects invalid season values', () => {
    expect(() =>
      pollenReferenceCreateSchema.parse({
        ...validCreatePayload,
        regions: [
          {
            region: 'EUROPE' as const,
            seasons: ['winter'],
            notes: null,
          },
        ],
      }),
    ).toThrow();
  });

  it('rejects create payloads without any region mappings', () => {
    expect(() =>
      pollenReferenceCreateSchema.parse({
        ...validCreatePayload,
        regions: [],
      }),
    ).toThrow();
  });

  it('requires a UUID id for update payloads', () => {
    expect(() =>
      pollenReferenceUpdateSchema.parse({
        id: 'not-a-uuid',
        plantName: 'Willow',
      }),
    ).toThrow();
  });
});
