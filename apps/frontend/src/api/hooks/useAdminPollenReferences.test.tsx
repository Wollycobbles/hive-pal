import { act, useEffect, type ReactElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '../client';
import {
  useActivateAdminPollenReference,
  useCreateAdminPollenReference,
  useDeactivateAdminPollenReference,
  useDeleteAdminPollenReference,
  useUpdateAdminPollenReference,
} from './useAdminPollenReferences';
import { toast } from 'sonner';
import { flushPromises, mountRoot } from '@/test/react-test-utils';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { defaultValue?: string }) =>
      options?.defaultValue ?? key,
  }),
}));

vi.mock('../client', () => ({
  apiClient: {
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    get: vi.fn(),
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockedApiClient = vi.mocked(apiClient);
const mockedToast = vi.mocked(toast);

function renderHookHarness(element: ReactElement) {
  return mountRoot(
    <QueryClientProvider client={new QueryClient()}>{element}</QueryClientProvider>,
  );
}

describe('useAdminPollenReferences toasts', () => {
  beforeEach(() => {
    mockedApiClient.post.mockReset();
    mockedApiClient.patch.mockReset();
    mockedApiClient.delete.mockReset();
    mockedToast.success.mockReset();
    mockedToast.error.mockReset();
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it.each([
    {
      label: 'create',
      reject: () => mockedApiClient.post.mockRejectedValueOnce({}),
      useHook: useCreateAdminPollenReference,
      payload: {} as never,
      message: 'Failed to create pollen record',
    },
    {
      label: 'update',
      reject: () => mockedApiClient.patch.mockRejectedValueOnce({}),
      useHook: useUpdateAdminPollenReference,
      payload: { id: 'record-1' } as never,
      message: 'Failed to update pollen record',
    },
    {
      label: 'delete',
      reject: () => mockedApiClient.delete.mockRejectedValueOnce({}),
      useHook: useDeleteAdminPollenReference,
      payload: 'record-1',
      message: 'Failed to delete pollen record',
    },
    {
      label: 'activate',
      reject: () => mockedApiClient.patch.mockRejectedValueOnce({}),
      useHook: useActivateAdminPollenReference,
      payload: 'record-1',
      message: 'Failed to activate pollen record',
    },
    {
      label: 'deactivate',
      reject: () => mockedApiClient.patch.mockRejectedValueOnce({}),
      useHook: useDeactivateAdminPollenReference,
      payload: 'record-1',
      message: 'Failed to deactivate pollen record',
    },
  ])('shows translated $label failure feedback', async ({ reject, useHook, payload, message }) => {
    reject();

    const Harness = () => {
      const mutation = useHook();

      useEffect(() => {
        void mutation.mutateAsync(payload).catch(() => undefined);
      }, [mutation]);

      return null;
    };

    const mounted = renderHookHarness(<Harness />);

    await act(async () => {
      await flushPromises();
    });

    expect(mockedToast.error).toHaveBeenCalledWith(message);

    mounted.unmount();
  });
});
