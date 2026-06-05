import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { Loader2, Search, RotateCcw } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { useApiaries } from '@/api/hooks';
import { getErrorMessage } from '@/api/hooks/useAdminPollenReferences';
import { usePollenReferences } from '@/api/hooks/usePollenReferences';
import { useApiaryStore } from '@/hooks/use-apiary';
import { getPollenRegionLabel, getSeasonLabel } from '@/utils/pollen-utils';
import {
  pollenRegionSchema,
  pollenSeasonSchema,
  pollenColorGroupSchema,
  type PollenColorGroup,
  type PollenRegion,
  type PollenReferenceUserRead,
  type PollenSeason,
} from 'shared-schemas';
import {
  getDefaultPollenRegion,
  getApiaryDefaultPollenRegion,
} from './pollen-identification-utils';

const REGION_OPTIONS = pollenRegionSchema.options;
const SEASON_OPTIONS = pollenSeasonSchema.options;
const COLOR_GROUP_OPTIONS = pollenColorGroupSchema.options;

export function parseScope(value: string | null): PollenRegion | null {
  const parsed = pollenRegionSchema.safeParse(value);

  return parsed.success ? parsed.data : null;
}

function parseSeasonValues(value: string | null): PollenSeason[] {
  if (!value) {
    return [];
  }

  return value
    .split(',')
    .map(part => part.trim())
    .filter((part): part is PollenSeason =>
      SEASON_OPTIONS.includes(part as PollenSeason),
    );
}

function parseColorGroup(value: string | null): PollenColorGroup | null {
  if (!value) {
    return null;
  }

  return COLOR_GROUP_OPTIONS.includes(value as PollenColorGroup)
    ? (value as PollenColorGroup)
    : null;
}

function parseSearchTerm(value: string | null): string {
  return value?.trim() ?? '';
}

function PollenHexagonSwatch({
  colorLabel,
  hexColor,
}: {
  colorLabel: string;
  hexColor: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        data-test="pollen-swatch"
        aria-hidden="true"
        className="h-11 w-11 shrink-0 border border-border shadow-sm"
        style={{
          backgroundColor: hexColor,
          clipPath:
            'polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)',
        }}
      />
      <div className="min-w-0">
        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {colorLabel}
        </div>
        <div className="text-sm text-muted-foreground">{hexColor}</div>
      </div>
    </div>
  );
}

function PollenResultCard({
  pollen,
  selectedScope,
  tt,
}: {
  pollen: PollenReferenceUserRead;
  selectedScope: PollenRegion;
  tt: (key: string, defaultValue: string) => string;
}) {
  const region = pollen.regions.find(entry => entry.region === selectedScope);
  const seasonLabels = (region?.seasons ?? []).map(season =>
    getSeasonLabel(season, tt, season),
  );

  return (
    <article
      data-test="pollen-result-item"
      className="rounded-xl border bg-card p-4 shadow-sm"
    >
      <div className="space-y-3">
        <div>
          <h3 className="text-base font-semibold leading-tight">
            {pollen.plantName}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {tt(
              'pollenIdentification.expectedTimeOfYear',
              'Expected time of year',
            )}: {seasonLabels.join(', ')}
          </p>
        </div>

        <PollenHexagonSwatch
          colorLabel={pollen.colorLabel}
          hexColor={pollen.hexColor}
        />
      </div>
    </article>
  );
}

export function PollenIdentificationPage() {
  const { t } = useTranslation('common');
  const tt = (key: string, defaultValue: string) =>
    t(key, { defaultValue });
  const [searchParams, setSearchParams] = useSearchParams();
  const { activeApiaryId } = useApiaryStore();
  const { data: apiaries, isLoading: isApiariesLoading } = useApiaries();

  const activeApiary = useMemo(
    () => apiaries?.find(apiary => apiary.id === activeApiaryId) ?? null,
    [apiaries, activeApiaryId],
  );

  const selectedScope = parseScope(searchParams.get('scope'));
  const selectedSeasons = parseSeasonValues(searchParams.get('season'));
  const selectedColorGroup = parseColorGroup(searchParams.get('colorGroup'));
  const searchTerm = parseSearchTerm(searchParams.get('search'));

  const apiaryDefaultScope = getApiaryDefaultPollenRegion(activeApiary);
  const defaultScope = getDefaultPollenRegion({
    apiary: activeApiary,
    language: typeof navigator !== 'undefined' ? navigator.language : 'en-GB',
  });

  const waitingForApiarySelection =
    !selectedScope && Boolean(activeApiaryId) && isApiariesLoading;

  useEffect(() => {
    if (selectedScope || waitingForApiarySelection) {
      return;
    }

    const nextScope = apiaryDefaultScope ?? defaultScope;
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('scope', nextScope);
    setSearchParams(nextParams, { replace: true });
  }, [
    apiaryDefaultScope,
    defaultScope,
    searchParams,
    selectedScope,
    setSearchParams,
    waitingForApiarySelection,
  ]);

  const pollenQuery = usePollenReferences(
    {
      region: selectedScope ?? undefined,
      season: selectedSeasons.length > 0 ? selectedSeasons : undefined,
      colorGroup: selectedColorGroup ?? undefined,
      search: searchTerm || undefined,
    },
    { enabled: Boolean(selectedScope) },
  );

  const pollenErrorMessage = pollenQuery.isError
    ? getErrorMessage(
        pollenQuery.error,
        tt(
          'pollenIdentification.results.error',
          'Failed to load pollen references',
        ),
      )
    : null;

  const sortedReferences = useMemo(
    () =>
      [...(pollenQuery.data ?? [])].sort((left, right) =>
        left.plantName.localeCompare(right.plantName),
      ),
    [pollenQuery.data],
  );

  const hasActiveFilters =
    selectedSeasons.length > 0 || Boolean(selectedColorGroup) || Boolean(searchTerm);

  const updateSearchParams = (updater: (params: URLSearchParams) => void) => {
    const nextParams = new URLSearchParams(searchParams);
    updater(nextParams);
    setSearchParams(nextParams, { replace: true });
  };

  const resetFilters = () => {
    updateSearchParams(params => {
      params.delete('season');
      params.delete('colorGroup');
      params.delete('search');
    });
  };

  const handleScopeChange = (scope: string) => {
    updateSearchParams(params => {
      params.set('scope', scope);
    });
  };

  const handleSeasonToggle = (season: PollenSeason) => {
    updateSearchParams(params => {
      const current = parseSeasonValues(params.get('season'));
      const next = current.includes(season)
        ? current.filter(value => value !== season)
        : [...current, season];

      if (next.length > 0) {
        params.set('season', next.join(','));
      } else {
        params.delete('season');
      }
    });
  };

  const handleColorGroupChange = (value: string) => {
    updateSearchParams(params => {
      if (value) {
        params.set('colorGroup', value);
      } else {
        params.delete('colorGroup');
      }
    });
  };

  const handleSearchChange = (value: string) => {
    updateSearchParams(params => {
      const nextValue = value.trim();

      if (nextValue) {
        params.set('search', nextValue);
      } else {
        params.delete('search');
      }
    });
  };

  const isInitialLoading =
    !selectedScope || waitingForApiarySelection || pollenQuery.isLoading;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 p-4 pb-8 sm:p-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">
          {tt('pollenIdentification.title', 'Pollen Identification')}
        </h1>
        <p className="text-sm text-muted-foreground">
          {tt(
            'pollenIdentification.description',
            'Browse likely pollen sources by broad region, season, and pollen colour.',
          )}
        </p>
        <p className="text-xs text-muted-foreground">
          {tt(
            'pollenIdentification.textOnlyNotice',
            'Text-only results. No images or detailed plant drill-downs in v1.',
          )}
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>{tt('pollenIdentification.filters.title', 'Filters')}</CardTitle>
          <CardDescription>
            {tt(
              'pollenIdentification.filters.description',
              'Use touch-friendly filters to narrow the pollen list for the selected scope.',
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <label
              id="pollen-scope-label"
              className="text-sm font-medium"
              htmlFor="pollen-scope-trigger"
            >
              {tt('pollenIdentification.filters.scope', 'Geographic scope')}
            </label>
            <Select
              value={selectedScope ?? ''}
              onValueChange={handleScopeChange}
            >
              <SelectTrigger
                id="pollen-scope-trigger"
                aria-labelledby="pollen-scope-label"
                className="h-11 w-full"
              >
                <SelectValue
                  placeholder={tt(
                    'pollenIdentification.filters.scopePlaceholder',
                    'Select a scope',
                  )}
                />
              </SelectTrigger>
              <SelectContent>
                {REGION_OPTIONS.map(region => (
                  <SelectItem key={region} value={region}>
                    {getPollenRegionLabel(region, tt)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label
              id="pollen-search-label"
              className="text-sm font-medium"
              htmlFor="pollen-search-input"
            >
              {tt('pollenIdentification.filters.search', 'Plant search')}
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="pollen-search-input"
                aria-labelledby="pollen-search-label"
                type="search"
                value={searchTerm}
                onChange={event => handleSearchChange(event.target.value)}
                placeholder={tt(
                  'pollenIdentification.filters.searchPlaceholder',
                  'Search plant names',
                )}
                className="h-11 pl-9"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              id="pollen-color-group-label"
              className="text-sm font-medium"
              htmlFor="pollen-color-group-trigger"
            >
              {tt('pollenIdentification.filters.colorGroup', 'Colour group')}
            </label>
            <Select
              value={selectedColorGroup ?? undefined}
              onValueChange={handleColorGroupChange}
            >
              <SelectTrigger
                id="pollen-color-group-trigger"
                aria-labelledby="pollen-color-group-label"
                className="h-11 w-full"
              >
                <SelectValue
                  placeholder={tt(
                    'pollenIdentification.filters.colorGroupPlaceholder',
                    'Any colour group',
                  )}
                />
              </SelectTrigger>
              <SelectContent>
                {COLOR_GROUP_OPTIONS.map(colorGroup => (
                  <SelectItem key={colorGroup} value={colorGroup}>
                    {tt(
                      `pollenIdentification.colorGroups.${colorGroup}`,
                      colorGroup.charAt(0).toUpperCase() + colorGroup.slice(1),
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <fieldset className="space-y-3">
            <legend className="text-sm font-medium">
              {tt('pollenIdentification.filters.seasons', 'Season')}
            </legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {SEASON_OPTIONS.map(season => {
                const checked = selectedSeasons.includes(season);

                return (
                  <label
                    key={season}
                    className={cn(
                      'flex items-center gap-3 rounded-lg border p-3 text-sm transition-colors',
                      checked && 'border-primary bg-primary/5',
                    )}
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => handleSeasonToggle(season)}
                    />
                      <span className="leading-tight">
                        {getSeasonLabel(season, tt, season)}
                      </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          {(selectedSeasons.length > 0 || selectedColorGroup || searchTerm) && (
            <div>
              <Button
                variant="outline"
                className="h-11 w-full"
                onClick={resetFilters}
              >
                <RotateCcw className="h-4 w-4" />
                {tt('pollenIdentification.filters.clear', 'Clear filters')}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{tt('pollenIdentification.results.title', 'Results')}</CardTitle>
          <CardDescription>
            {selectedScope
              ? getPollenRegionLabel(selectedScope, tt)
              : tt('pollenIdentification.results.loading', 'Loading pollen references...')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pollenQuery.isError ? (
            <div className="space-y-3 py-4">
              <Alert variant="destructive">
                <AlertDescription>{pollenErrorMessage}</AlertDescription>
              </Alert>
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  className="h-11"
                  onClick={() => void pollenQuery.refetch()}
                >
                  {tt('actions.retry', 'Retry')}
                </Button>
              </div>
            </div>
          ) : isInitialLoading ? (
            <div className="flex items-center gap-3 py-8 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{tt('pollenIdentification.results.loading', 'Loading pollen references...')}</span>
            </div>
          ) : sortedReferences.length === 0 ? (
            <div className="space-y-3 py-4">
              <div className="space-y-1">
                <h3 className="text-base font-semibold">
                  {hasActiveFilters
                    ? tt(
                        'pollenIdentification.results.noResultsTitle',
                        'No matching pollen references',
                      )
                    : tt(
                        'pollenIdentification.results.emptyTitle',
                        'No pollen references yet',
                      )}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {hasActiveFilters
                    ? tt(
                        'pollenIdentification.results.noResultsDescription',
                        'Try clearing filters or choosing a different scope.',
                      )
                    : tt(
                        'pollenIdentification.results.emptyDescription',
                        'There are no active pollen references for this scope.',
                      )}
                </p>
              </div>

              {hasActiveFilters && (
                <Button variant="outline" className="h-11 w-full" onClick={resetFilters}>
                  <RotateCcw className="h-4 w-4" />
                  {tt('pollenIdentification.filters.clear', 'Clear filters')}
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {sortedReferences.map(pollen => (
                <PollenResultCard
                  key={pollen.id}
                  pollen={pollen}
                  selectedScope={selectedScope!}
                  tt={tt}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
