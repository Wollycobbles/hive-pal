import { act, type ReactElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { PollenReferenceAdminListItem } from 'shared-schemas';
import { AdminProtectedRoute } from '@/routes/admin-protected-route';
import { mountRoot } from '@/test/react-test-utils';
import PollenRecordsPage from './pollen-records-page';

const records: PollenReferenceAdminListItem[] = [
  {
    id: 'active-1',
    plantName: 'Willow',
    scientificName: 'Salix spp.',
    colorLabel: 'pale yellow',
    colorGroup: 'yellow',
    hexColor: '#facc15',
    notes: null,
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z',
    regions: [{ region: 'EUROPE', seasons: ['spring'], notes: null }],
  },
  {
    id: 'inactive-1',
    plantName: 'Heather',
    scientificName: null,
    colorLabel: 'pink-purple',
    colorGroup: 'red',
    hexColor: '#c084fc',
    notes: null,
    active: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-03T00:00:00.000Z',
    regions: [{ region: 'UK_AND_IRELAND', seasons: ['late-summer'], notes: null }],
  },
];

const listRefetch = vi.fn();
const deleteMutate = vi.fn();
const activateMutate = vi.fn();
const deactivateMutate = vi.fn();
const createMutate = vi.fn();
const updateMutate = vi.fn();

const queryState = {
  data: records as PollenReferenceAdminListItem[] | undefined,
  isLoading: false,
  isFetching: false,
  isError: false,
  error: null as unknown,
  refetch: listRefetch,
};

const deleteMutationState = { mutateAsync: deleteMutate, isPending: false };
const activateMutationState = { mutateAsync: activateMutate, isPending: false };
const deactivateMutationState = { mutateAsync: deactivateMutate, isPending: false };
const createMutationState = { mutateAsync: createMutate, isPending: false };
const updateMutationState = { mutateAsync: updateMutate, isPending: false };

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = ResizeObserverMock as typeof ResizeObserver;
}

let authState = {
  isLoggedIn: true,
  token: createJwt('ADMIN'),
};

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { defaultValue?: string }) =>
      options?.defaultValue ?? key,
  }),
}));

vi.mock('@/context/auth-context', () => ({
  useAuth: () => authState,
}));

vi.mock('@/api/hooks/useAdminPollenReferences', () => ({
  getErrorMessage: (_error: unknown, fallback: string) => fallback,
  useAdminPollenReferences: () => queryState,
  useDeleteAdminPollenReference: () => deleteMutationState,
  useActivateAdminPollenReference: () => activateMutationState,
  useDeactivateAdminPollenReference: () => deactivateMutationState,
  useCreateAdminPollenReference: () => createMutationState,
  useUpdateAdminPollenReference: () => updateMutationState,
}));

function createJwt(role: 'ADMIN' | 'USER') {
  const encode = (value: object) =>
    btoa(JSON.stringify(value))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/g, '');

  return `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({
    exp: Math.floor(Date.now() / 1000) + 3600,
    iat: Math.floor(Date.now() / 1000),
    sub: 'user-1',
    email: 'admin@example.com',
    role,
  })}.signature`;
}

function mountPage(element: ReactElement) {
  return mountRoot(<MemoryRouter>{element}</MemoryRouter>);
}

function resetQueryState() {
  queryState.data = records;
  queryState.isLoading = false;
  queryState.isFetching = false;
  queryState.isError = false;
  queryState.error = null;
}

describe('PollenRecordsPage', () => {
  beforeEach(() => {
    resetQueryState();
    listRefetch.mockReset();
    deleteMutate.mockReset();
    activateMutate.mockReset();
    deactivateMutate.mockReset();
    createMutate.mockReset();
    updateMutate.mockReset();
    deleteMutationState.isPending = false;
    activateMutationState.isPending = false;
    deactivateMutationState.isPending = false;
    createMutationState.isPending = false;
    updateMutationState.isPending = false;
    authState = {
      isLoggedIn: true,
      token: createJwt('ADMIN'),
    };
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('blocks non-admin routes', () => {
    authState = {
      isLoggedIn: true,
      token: createJwt('USER'),
    };

    const mounted = mountPage(
      <AdminProtectedRoute>
        <PollenRecordsPage />
      </AdminProtectedRoute>,
    );

    expect(mounted.container.textContent).not.toContain('Pollen Record Management');
    mounted.unmount();
  });

  it('renders an error state with retry', () => {
    queryState.data = undefined;
    queryState.isError = true;
    queryState.error = {};

    const mounted = mountPage(<PollenRecordsPage />);

    expect(mounted.container.textContent).toContain('Failed to load pollen records');
    expect(mounted.container.textContent).toContain('actions.refresh');
    mounted.unmount();
  });

  it('renders active and inactive records with actions', () => {
    const mounted = mountPage(<PollenRecordsPage />);

    expect(mounted.container.textContent).toContain('Willow');
    expect(mounted.container.textContent).toContain('Heather');
    expect(mounted.container.textContent).toContain('adminPollenRecords.status.active');
    expect(mounted.container.textContent).toContain('adminPollenRecords.status.inactive');
    mounted.unmount();
  });

  it('opens the create flow and confirm dialogs', () => {
    const mounted = mountPage(<PollenRecordsPage />);

    const buttons = Array.from(mounted.container.querySelectorAll('button'));
    expect(
      buttons.some(button => button.textContent?.includes('adminPollenRecords.create')),
    ).toBe(true);

    act(() => {
      buttons.find(button => button.textContent?.includes('adminPollenRecords.create'))?.click();
    });

    expect(document.body.textContent).toContain('adminPollenRecords.form.createTitle');

    mounted.unmount();
  });

  it('disables confirm dialog actions while a mutation is pending', () => {
    deleteMutationState.isPending = true;

    const mounted = mountPage(<PollenRecordsPage />);

    const deleteButton = Array.from(mounted.container.querySelectorAll('button')).find(button =>
      button.textContent?.includes('actions.delete'),
    ) as HTMLButtonElement;

    act(() => {
      deleteButton.click();
    });

    const dialogButtons = Array.from(document.body.querySelectorAll('button'));
    const confirmButton = dialogButtons.find(
      button => button.textContent === 'actions.delete' && button.disabled,
    ) as HTMLButtonElement;

    expect(confirmButton.disabled).toBe(true);
    expect(document.body.querySelector('.animate-spin')).not.toBeNull();

    mounted.unmount();
  });

  it('confirms deactivate and delete actions', async () => {
    const mounted = mountPage(<PollenRecordsPage />);

    const deactivateButton = Array.from(mounted.container.querySelectorAll('button')).find(button =>
      button.textContent?.includes('adminPollenRecords.actions.deactivate'),
    ) as HTMLButtonElement;

    await act(async () => {
      deactivateButton.click();
    });

    expect(document.body.textContent).toContain('adminPollenRecords.dialogs.deactivateTitle');

    const confirmDeactivate = Array.from(document.body.querySelectorAll('button')).reverse().find(
      button => button.textContent === 'adminPollenRecords.dialogs.deactivateConfirm',
    ) as HTMLButtonElement;

    await act(async () => {
      confirmDeactivate.click();
    });

    expect(deactivateMutate).toHaveBeenCalledWith('active-1');

    const deleteButton = Array.from(mounted.container.querySelectorAll('button')).find(button =>
      button.textContent?.includes('actions.delete'),
    ) as HTMLButtonElement;

    await act(async () => {
      deleteButton.click();
    });

    const confirmDelete = Array.from(document.body.querySelectorAll('button')).reverse().find(
      button => button.textContent === 'actions.delete',
    ) as HTMLButtonElement;

    await act(async () => {
      confirmDelete.click();
    });

    expect(deleteMutate).toHaveBeenCalledWith('active-1');

    mounted.unmount();
  });
});
