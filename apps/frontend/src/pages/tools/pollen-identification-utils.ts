import type { ApiaryResponse, PollenRegion } from 'shared-schemas';

type ApiaryLocation = Pick<ApiaryResponse, 'location' | 'latitude' | 'longitude'>;

const UK_AND_IRELAND_BOUNDS = {
  minLatitude: 49,
  maxLatitude: 60.5,
  minLongitude: -11,
  maxLongitude: 3,
};

const EUROPE_BOUNDS = {
  minLatitude: 34,
  maxLatitude: 72,
  minLongitude: -25,
  maxLongitude: 45,
};

const UK_AND_IRELAND_LOCATION_PATTERNS = [
  /\bunited kingdom\b/i,
  /\bgreat britain\b/i,
  /\bbritain\b/i,
  /\buk\b/i,
  /\bengland\b/i,
  /\bscotland\b/i,
  /\bwales\b/i,
  /\bnorthern ireland\b/i,
  /\bireland\b/i,
];

export function getApiaryDefaultPollenRegion(
  apiary?: ApiaryLocation | null,
): PollenRegion | null {
  if (!apiary) {
    return null;
  }

  if (typeof apiary.latitude === 'number' && typeof apiary.longitude === 'number') {
    const { latitude, longitude } = apiary;

    if (
      latitude >= UK_AND_IRELAND_BOUNDS.minLatitude &&
      latitude <= UK_AND_IRELAND_BOUNDS.maxLatitude &&
      longitude >= UK_AND_IRELAND_BOUNDS.minLongitude &&
      longitude <= UK_AND_IRELAND_BOUNDS.maxLongitude
    ) {
      return 'UK_AND_IRELAND';
    }

    if (
      latitude >= EUROPE_BOUNDS.minLatitude &&
      latitude <= EUROPE_BOUNDS.maxLatitude &&
      longitude >= EUROPE_BOUNDS.minLongitude &&
      longitude <= EUROPE_BOUNDS.maxLongitude
    ) {
      return 'EUROPE';
    }
  }

  const location = apiary.location?.trim();
  if (!location) {
    return null;
  }

  if (UK_AND_IRELAND_LOCATION_PATTERNS.some(pattern => pattern.test(location))) {
    return 'UK_AND_IRELAND';
  }

  if (/\beurope\b/i.test(location)) {
    return 'EUROPE';
  }

  return null;
}

export function getLanguageFallbackPollenRegion(language: string): PollenRegion {
  if (/^en[-_](gb|ie)\b/i.test(language)) {
    return 'UK_AND_IRELAND';
  }

  return 'EUROPE';
}

export function getDefaultPollenRegion(options: {
  apiary?: ApiaryLocation | null;
  language: string;
}): PollenRegion {
  return (
    getApiaryDefaultPollenRegion(options.apiary) ??
    getLanguageFallbackPollenRegion(options.language)
  );
}
