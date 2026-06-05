import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { apiClient } from '../client';
import {
  type PollenColorGroup,
  type PollenReferenceUserRead,
  type PollenRegion,
  type PollenSeason,
} from 'shared-schemas';
import { logApiError } from '../errorLogger';

export type PollenReferenceFilters = {
  region?: PollenRegion;
  season?: PollenSeason[];
  colorGroup?: PollenColorGroup;
  search?: string;
};

const POLLEN_REFERENCE_KEYS = {
  all: ['pollen-references'] as const,
  list: (filters: PollenReferenceFilters) => [
    ...POLLEN_REFERENCE_KEYS.all,
    filters.region ?? 'all',
    filters.season?.join(',') ?? 'all',
    filters.colorGroup ?? 'all',
    filters.search?.trim() ?? 'all',
  ] as const,
};

export const usePollenReferences = (
  filters: PollenReferenceFilters,
  options?: Omit<
    UseQueryOptions<PollenReferenceUserRead[]>,
    'queryKey' | 'queryFn'
  >,
) => {
  return useQuery<PollenReferenceUserRead[]>({
    queryKey: POLLEN_REFERENCE_KEYS.list(filters),
    queryFn: async () => {
      try {
        const params = new URLSearchParams();

        if (filters.region) {
          params.set('region', filters.region);
        }

        if (filters.season?.length) {
          params.set('season', filters.season.join(','));
        }

        if (filters.colorGroup) {
          params.set('colorGroup', filters.colorGroup);
        }

        if (filters.search?.trim()) {
          params.set('search', filters.search.trim());
        }

        const response = await apiClient.get<PollenReferenceUserRead[]>(
          `/api/pollen-references${params.toString() ? `?${params.toString()}` : ''}`,
        );

        return response.data;
      } catch (error) {
        logApiError(error, '/api/pollen-references', 'GET');
        throw error;
      }
    },
    enabled: options?.enabled ?? true,
    retry: false,
    staleTime: 60_000,
    ...options,
  });
};
