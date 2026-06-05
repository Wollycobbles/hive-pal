import { z } from 'zod';
import {
  pollenColorGroupSchema,
  pollenRegionSchema,
  pollenSeasonSchema,
} from 'shared-schemas';

const pollenSeasonQueryValueSchema = z.preprocess((value) => {
  if (value == null || value === '') {
    return undefined;
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => String(item).split(',')).map((item) => item.trim()).filter(Boolean);
  }

  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}, z.array(pollenSeasonSchema).min(1).optional());

export const pollenReferenceListQuerySchema = z
  .object({
    scope: pollenRegionSchema.optional(),
    region: pollenRegionSchema.optional(),
    season: pollenSeasonQueryValueSchema,
    colorGroup: pollenColorGroupSchema.optional(),
    search: z.string().trim().min(1).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.scope && value.region && value.scope !== value.region) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['region'],
        message: 'scope and region must match when both are provided',
      });
    }
  })
  .transform((value) => ({
    region: value.scope ?? value.region,
    season: value.season,
    colorGroup: value.colorGroup,
    search: value.search,
  }));

export type PollenReferenceListQuery = {
  region?: z.infer<typeof pollenRegionSchema>;
  season?: z.infer<typeof pollenSeasonSchema>[];
  colorGroup?: z.infer<typeof pollenColorGroupSchema>;
  search?: string;
};
