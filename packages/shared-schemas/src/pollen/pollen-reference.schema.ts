import { z } from 'zod';

export const pollenRegionSchema = z.enum([
  'UK_AND_IRELAND',
  'EUROPE',
  'NORTH_AMERICA',
  'AUSTRALIA_AND_NEW_ZEALAND',
  'SOUTH_AMERICA',
  'ASIA',
  'AFRICA',
]);

export type PollenRegion = z.infer<typeof pollenRegionSchema>;

export const pollenSeasonSchema = z.enum([
  'early-spring',
  'spring',
  'late-spring',
  'summer',
  'late-summer',
  'autumn',
]);

export type PollenSeason = z.infer<typeof pollenSeasonSchema>;

export const pollenColorGroupSchema = z.enum([
  'black',
  'blue',
  'brown',
  'cream',
  'green',
  'grey',
  'orange',
  'red',
  'yellow',
]);

export type PollenColorGroup = z.infer<typeof pollenColorGroupSchema>;

const pollenHexColorSchema = z
  .string()
  .regex(/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Must be a valid hex colour');

const pollenReferenceCoreSchema = z.object({
  plantName: z.string().trim().min(1),
  scientificName: z.string().nullish(),
  colorLabel: z.string().trim().min(1),
  colorGroup: pollenColorGroupSchema,
  hexColor: pollenHexColorSchema,
  notes: z.string().nullish(),
});

export const pollenReferenceRegionSchema = z.object({
  region: pollenRegionSchema,
  seasons: z.array(pollenSeasonSchema).min(1),
  notes: z.string().nullish(),
});

const pollenReferenceRegionsSchema = z
  .array(pollenReferenceRegionSchema)
  .min(1)
  .superRefine((regions, ctx) => {
    const seenRegions = new Set<PollenRegion>();

    regions.forEach((region, index) => {
      if (seenRegions.has(region.region)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [index, 'region'],
          message: `Duplicate region mapping: ${region.region}`,
        });
        return;
      }

      seenRegions.add(region.region);
    });
  });

export type PollenReferenceRegion = z.infer<typeof pollenReferenceRegionSchema>;

export const pollenReferenceCreateSchema = pollenReferenceCoreSchema.extend({
  active: z.boolean().default(true),
  regions: pollenReferenceRegionsSchema,
});

export type PollenReferenceCreate = z.infer<typeof pollenReferenceCreateSchema>;

export const pollenReferenceUpdateSchema = pollenReferenceCoreSchema
  .partial()
  .extend({
    id: z.string().uuid(),
    active: z.boolean().optional(),
    regions: pollenReferenceRegionsSchema.optional(),
  });

export type PollenReferenceUpdate = z.infer<typeof pollenReferenceUpdateSchema>;

export const pollenReferenceUserReadSchema = pollenReferenceCoreSchema.extend({
  id: z.string().uuid(),
  regions: pollenReferenceRegionsSchema,
});

export type PollenReferenceUserRead = z.infer<typeof pollenReferenceUserReadSchema>;

export const pollenReferenceAdminListItemSchema = pollenReferenceUserReadSchema.extend({
  active: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type PollenReferenceAdminListItem = z.infer<
  typeof pollenReferenceAdminListItemSchema
>;
