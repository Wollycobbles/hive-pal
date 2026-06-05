import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import {
  pollenRegionSchema,
  type PollenReferenceUserRead,
  type PollenSeason,
} from 'shared-schemas';
import {
  mountRoot,
  setInputValue,
  waitForCondition,
} from '@/test/react-test-utils';
import { REGION_LABELS } from '@/utils/pollen-utils';
import { parseScope, PollenIdentificationPage } from './pollen-identification-page';

type MockFilters = {
  region?: string;
  season?: PollenSeason[];
  colorGroup?: string;
  search?: string;
};

const fixtures: PollenReferenceUserRead[] = [
  {
    id: 'clover',
    plantName: 'Clover',
    scientificName: null,
    colorLabel: 'bright yellow',
    colorGroup: 'yellow',
    hexColor: '#facc15',
    notes: null,
    regions: [
      {
        region: 'UK_AND_IRELAND',
        seasons: ['spring'],
        notes: null,
      },
    ],
  },
  {
    id: 'heather',
    plantName: 'Heather',
    scientificName: null,
    colorLabel: 'reddish orange',
    colorGroup: 'orange',
    hexColor: '#fb923c',
    notes: null,
    regions: [
      {
        region: 'UK_AND_IRELAND',
        seasons: ['late-summer'],
        notes: null,
      },
    ],
  },
];
const baselineFixtures = [...fixtures];

let lastFilters: MockFilters | null = null;
let pollenQueryMode: 'success' | 'error' = 'success';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { defaultValue?: string }) =>
      options?.defaultValue ?? key,
  }),
}));

vi.mock('@/api/hooks', () => ({
  useApiaries: () => ({
    data: [
      {
        id: 'apiary-1',
        location: 'Cornwall, United Kingdom',
        latitude: 50.118,
        longitude: -5.53,
      },
    ],
    isLoading: false,
  }),
}));

vi.mock('@/hooks/use-apiary', () => ({
  useApiaryStore: () => ({
    activeApiaryId: 'apiary-1',
  }),
}));

vi.mock('@/api/hooks/usePollenReferences', () => ({
  usePollenReferences: (filters: MockFilters) => {
    lastFilters = filters;

    if (pollenQueryMode === 'error') {
      return {
        data: undefined,
        error: new Error('Failed to load pollen references'),
        isError: true,
        isFetching: false,
        isLoading: false,
        refetch: vi.fn(),
      };
    }

    if (!filters.region) {
      return { data: undefined, isLoading: true, isFetching: false, isError: false, refetch: vi.fn() };
    }

    const filtered = fixtures.filter(item => {
      if (
        filters.region &&
        !item.regions.some(region => region.region === filters.region)
      ) {
        return false;
      }

      if (
        filters.season?.length &&
        !item.regions.some(
          region =>
            region.region === filters.region &&
            filters.season?.some(season => region.seasons.includes(season)),
        )
      ) {
        return false;
      }

      if (filters.colorGroup && item.colorGroup !== filters.colorGroup) {
        return false;
      }

      if (
        filters.search &&
        !item.plantName.toLowerCase().includes(filters.search.toLowerCase())
      ) {
        return false;
      }

      return true;
    });

    return {
      data: filtered,
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: vi.fn(),
    };
  },
}));

function mountPage(initialEntry = '/tools/pollen-identification') {
  return mountRoot(
    <MemoryRouter initialEntries={[initialEntry]}>
      <PollenIdentificationPage />
    </MemoryRouter>,
  );
}

describe('PollenIdentificationPage', () => {
  beforeEach(() => {
    lastFilters = null;
    pollenQueryMode = 'success';
  });

  afterEach(() => {
    document.body.innerHTML = '';
    fixtures.splice(0, fixtures.length, ...baselineFixtures);
  });

  it('defaults to the active apiary region and renders text-only results', async () => {
    const mounted = mountPage();

    await waitForCondition(() => Boolean(mounted.container.textContent?.includes('Clover')));

    expect(lastFilters?.region).toBe('UK_AND_IRELAND');
    expect(mounted.container.textContent).toContain('Clover');
    expect(mounted.container.textContent).toContain('Expected time of year');

    const swatch = mounted.container.querySelector('[data-test="pollen-swatch"]');
    expect(swatch).not.toBeNull();
    expect(swatch?.tagName).not.toBe('BUTTON');
    expect(mounted.container.querySelector('a')).toBeNull();
    mounted.unmount();
  });

  it('accepts every valid pollen region in parseScope', () => {
    pollenRegionSchema.options.forEach(region => {
      expect(parseScope(region)).toBe(region);
    });

    expect(parseScope('NOT_A_REGION')).toBeNull();
  });

  it('shows all supported regions in the scope dropdown', async () => {
    const mounted = mountPage('/tools/pollen-identification?scope=EUROPE');

    await waitForCondition(() => lastFilters?.region === 'EUROPE');

    const trigger = mounted.container.querySelector('#pollen-scope-trigger') as HTMLElement;
    expect(trigger).not.toBeNull();

    act(() => {
      trigger.focus();
      trigger.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
      );
    });

    await waitForCondition(() =>
      pollenRegionSchema.options.every(region =>
        document.body.textContent?.includes(REGION_LABELS[region]),
      ),
    );

    Object.values(REGION_LABELS).forEach(label => {
      expect(document.body.textContent).toContain(label);
    });

    mounted.unmount();
  });

  it.each([
    'UK_AND_IRELAND',
    'EUROPE',
    'NORTH_AMERICA',
    'ASIA',
    'AFRICA',
    'AUSTRALIA_AND_NEW_ZEALAND',
    'SOUTH_AMERICA',
  ] as const)('navigates to %s from the URL scope value', async scope => {
    const mounted = mountPage(`/tools/pollen-identification?scope=${scope}`);

    await waitForCondition(() => lastFilters?.region === scope);

    expect(lastFilters?.region).toBe(scope);
    mounted.unmount();
  });

  it('updates filters and shows no-results state when nothing matches', async () => {
    const mounted = mountPage();

    await waitForCondition(() => Boolean(mounted.container.textContent?.includes('Clover')));

    const seasonCheckboxes = mounted.container.querySelectorAll('[role="checkbox"]');
    expect(seasonCheckboxes.length).toBeGreaterThan(0);

    act(() => {
      (seasonCheckboxes[0] as HTMLElement).click();
    });

    await waitForCondition(() => Boolean(lastFilters?.season?.length));
    expect(lastFilters?.season).toContain('early-spring');

    const searchInput = mounted.container.querySelector('input[type="search"]') as HTMLInputElement;

    act(() => {
      setInputValue(searchInput, 'zzz');
    });

    await waitForCondition(() => lastFilters?.search === 'zzz');
    await waitForCondition(() => mounted.container.textContent?.includes('No matching pollen references'));

    expect(mounted.container.textContent).toContain('No matching pollen references');
    mounted.unmount();
  });

  it('shows the empty state when no pollen references exist for the scope', async () => {
    const originalFixtures = [...fixtures];
    fixtures.splice(0, fixtures.length);

    try {
        const mounted = mountPage();

        await waitForCondition(() => Boolean(mounted.container.textContent?.includes('No pollen references yet')));

        expect(mounted.container.textContent).toContain('No pollen references yet');
        expect(mounted.container.textContent).toContain(
          'There are no active pollen references for this scope.',
        );

        mounted.unmount();
    } finally {
      fixtures.splice(0, fixtures.length, ...originalFixtures);
    }
  });

  it('shows an error state when pollen references fail to load', async () => {
    pollenQueryMode = 'error';

    const mounted = mountPage('/tools/pollen-identification?scope=EUROPE');

    await waitForCondition(() => Boolean(mounted.container.textContent?.includes('Failed to load pollen references')));

    expect(mounted.container.textContent).toContain('Failed to load pollen references');
    expect(mounted.container.textContent).toContain('Retry');
    mounted.unmount();
  });

  it('keeps locale keys in sync for all region labels', () => {
    const commonPath = join(process.cwd(), 'public/locales/en/common.json');
    const common = JSON.parse(readFileSync(commonPath, 'utf8')) as {
      pollenIdentification: { scope: Record<string, string> };
    };

    expect(common.pollenIdentification.scope).toMatchObject({
      ...REGION_LABELS,
    });
  });
});
