import type { PollenSeason, PollenRegion } from 'shared-schemas';

/**
 * Convert a kebab-case season string to camelCase for translation keys
 * @param season Season in kebab-case format (e.g., 'early-spring')
 * @returns Season in camelCase format (e.g., 'earlySpring')
 */
export function seasonToTranslationKey(season: PollenSeason): string {
  return season.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());
}

/**
 * Get formatted label for a season using translation
 * @param season Season value
 * @param tt Translation function
 * @param fallback Optional fallback text
 * @returns Formatted season label
 */
export function getSeasonLabel(
  season: PollenSeason,
  tt: (key: string, fallback?: string) => string,
  fallback?: string,
): string {
  const key = seasonToTranslationKey(season);
  return tt(`pollenIdentification.seasons.${key}`, fallback || season);
}

/**
 * Region display labels
 */
export const REGION_LABELS: Record<PollenRegion, string> = {
  UK_AND_IRELAND: 'UK & Ireland',
  EUROPE: 'Europe',
  NORTH_AMERICA: 'North America',
  ASIA: 'Asia',
  AFRICA: 'Africa',
  AUSTRALIA_AND_NEW_ZEALAND: 'Australia & New Zealand',
  SOUTH_AMERICA: 'South America',
};

/**
 * Get formatted label for a region using translation
 * @param region Region value
 * @param tt Translation function
 * @returns Formatted region label
 */
export function getPollenRegionLabel(
  region: PollenRegion,
  tt: (key: string, defaultValue: string) => string,
): string {
  return tt(`pollenIdentification.scope.${region}`, REGION_LABELS[region]);
}
