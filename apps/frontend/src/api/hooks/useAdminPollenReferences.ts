import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../client';
import {
  type PollenReferenceAdminListItem,
  type PollenReferenceCreate,
  type PollenReferenceUpdate,
} from 'shared-schemas';
import { logApiError } from '../errorLogger';
import { toast } from 'sonner';

const ADMIN_POLLEN_REFERENCE_KEYS = {
  all: ['admin', 'pollen-references'] as const,
  list: () => [...ADMIN_POLLEN_REFERENCE_KEYS.all, 'list'] as const,
};

export const getErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? fallback;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};

export const useAdminPollenReferences = () => {
  return useQuery<PollenReferenceAdminListItem[]>({
    queryKey: ADMIN_POLLEN_REFERENCE_KEYS.list(),
    queryFn: async () => {
      try {
        const response = await apiClient.get<PollenReferenceAdminListItem[]>(
          '/api/admin/pollen-references',
        );

        return response.data;
      } catch (error) {
        logApiError(error, '/api/admin/pollen-references', 'GET');
        throw error;
      }
    },
    staleTime: 30_000,
  });
};

type MutationConfig<TData, TVariables> = {
  mutationFn: (variables: TVariables) => Promise<TData>;
  successKey: string;
  successDefault: string;
  errorKey: string;
  errorDefault: string;
};

const useAdminPollenReferenceMutation = <TData, TVariables>(
  config: MutationConfig<TData, TVariables>,
) => {
  const queryClient = useQueryClient();
  const { t } = useTranslation('common');

  return useMutation({
    mutationFn: config.mutationFn,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ADMIN_POLLEN_REFERENCE_KEYS.list(),
      });
      toast.success(
        t(config.successKey, {
          defaultValue: config.successDefault,
        }),
      );
    },
    onError: error => {
      toast.error(
        getErrorMessage(
          error,
          t(config.errorKey, {
            defaultValue: config.errorDefault,
          }),
        ),
      );
    },
  });
};

export const useCreateAdminPollenReference = () => {
  return useAdminPollenReferenceMutation<
    PollenReferenceAdminListItem,
    PollenReferenceCreate
  >({
    mutationFn: async data => {
      const response = await apiClient.post<PollenReferenceAdminListItem>(
        '/api/admin/pollen-references',
        data,
      );
      return response.data;
    },
    successKey: 'adminPollenRecords.toasts.created',
    successDefault: 'Pollen record created',
    errorKey: 'adminPollenRecords.toasts.createFailed',
    errorDefault: 'Failed to create pollen record',
  });
};

export const useUpdateAdminPollenReference = () => {
  return useAdminPollenReferenceMutation<
    PollenReferenceAdminListItem,
    PollenReferenceUpdate
  >({
    mutationFn: async data => {
      const response = await apiClient.patch<PollenReferenceAdminListItem>(
        `/api/admin/pollen-references/${data.id}`,
        data,
      );
      return response.data;
    },
    successKey: 'adminPollenRecords.toasts.updated',
    successDefault: 'Pollen record updated',
    errorKey: 'adminPollenRecords.toasts.updateFailed',
    errorDefault: 'Failed to update pollen record',
  });
};

export const useDeleteAdminPollenReference = () => {
  return useAdminPollenReferenceMutation<PollenReferenceAdminListItem, string>({
    mutationFn: async id => {
      const response = await apiClient.delete<PollenReferenceAdminListItem>(
        `/api/admin/pollen-references/${id}`,
      );
      return response.data;
    },
    successKey: 'adminPollenRecords.toasts.deleted',
    successDefault: 'Pollen record deleted',
    errorKey: 'adminPollenRecords.toasts.deleteFailed',
    errorDefault: 'Failed to delete pollen record',
  });
};

export const useActivateAdminPollenReference = () => {
  return useAdminPollenReferenceMutation<PollenReferenceAdminListItem, string>({
    mutationFn: async id => {
      const response = await apiClient.patch<PollenReferenceAdminListItem>(
        `/api/admin/pollen-references/${id}/activate`,
      );
      return response.data;
    },
    successKey: 'adminPollenRecords.toasts.activated',
    successDefault: 'Pollen record activated',
    errorKey: 'adminPollenRecords.toasts.activateFailed',
    errorDefault: 'Failed to activate pollen record',
  });
};

export const useDeactivateAdminPollenReference = () => {
  return useAdminPollenReferenceMutation<PollenReferenceAdminListItem, string>({
    mutationFn: async id => {
      const response = await apiClient.patch<PollenReferenceAdminListItem>(
        `/api/admin/pollen-references/${id}/deactivate`,
      );
      return response.data;
    },
    successKey: 'adminPollenRecords.toasts.deactivated',
    successDefault: 'Pollen record deactivated',
    errorKey: 'adminPollenRecords.toasts.deactivateFailed',
    errorDefault: 'Failed to deactivate pollen record',
  });
};
