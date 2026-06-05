import { describe, expect, it } from 'vitest';
import { getDefaultPollenRegion } from './pollen-identification-utils';

describe('getDefaultPollenRegion', () => {
  it('prefers an apiary mapped to UK and Ireland', () => {
    expect(
      getDefaultPollenRegion({
        apiary: {
          location: 'Galway, Ireland',
          latitude: 53.27,
          longitude: -9.05,
        },
        language: 'fr-FR',
      }),
    ).toBe('UK_AND_IRELAND');
  });

  it('falls back to the language heuristic when apiary data is not mappable', () => {
    expect(
      getDefaultPollenRegion({
        apiary: {
          location: 'Unknown location',
          latitude: null,
          longitude: null,
        },
        language: 'en-GB',
      }),
    ).toBe('UK_AND_IRELAND');
  });

  it('falls back to Europe when nothing else matches', () => {
    expect(
      getDefaultPollenRegion({
        apiary: null,
        language: 'en-US',
      }),
    ).toBe('EUROPE');
  });
});
