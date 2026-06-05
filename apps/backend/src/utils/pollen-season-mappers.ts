import { PollenSeason as SchemaPollenSeason } from 'shared-schemas';

export type PrismaPollenSeason =
  | 'EARLY_SPRING'
  | 'SPRING'
  | 'LATE_SPRING'
  | 'SUMMER'
  | 'LATE_SUMMER'
  | 'AUTUMN';

const pollenSeasonToPrismaSeasonMap: Record<SchemaPollenSeason, PrismaPollenSeason> = {
  'early-spring': 'EARLY_SPRING',
  spring: 'SPRING',
  'late-spring': 'LATE_SPRING',
  summer: 'SUMMER',
  'late-summer': 'LATE_SUMMER',
  autumn: 'AUTUMN',
};

const prismaSeasonToPollenSeasonMap: Record<PrismaPollenSeason, SchemaPollenSeason> = {
  EARLY_SPRING: 'early-spring',
  SPRING: 'spring',
  LATE_SPRING: 'late-spring',
  SUMMER: 'summer',
  LATE_SUMMER: 'late-summer',
  AUTUMN: 'autumn',
};

/**
 * Convert schema-format pollen seasons to Prisma enum format
 * @param seasons Array of seasons in kebab-case format
 * @returns Array of seasons in UPPER_SNAKE_CASE format
 */
export const toPrismaPollenSeasons = (
  seasons: SchemaPollenSeason[],
): PrismaPollenSeason[] =>
  seasons.map((season) => pollenSeasonToPrismaSeasonMap[season]);

/**
 * Convert Prisma enum seasons to schema format
 * @param seasons Array of seasons in UPPER_SNAKE_CASE format
 * @returns Array of seasons in kebab-case format
 */
export const toPollenSeasons = (
  seasons: PrismaPollenSeason[],
): SchemaPollenSeason[] => seasons.map((season) => prismaSeasonToPollenSeasonMap[season]);

/**
 * Season mapping for use in scripts that need plain object mapping
 * (e.g., seed scripts, bootstrap scripts)
 */
export const pollenSeasonMap: Record<string, PrismaPollenSeason> = 
  pollenSeasonToPrismaSeasonMap as Record<string, PrismaPollenSeason>;
