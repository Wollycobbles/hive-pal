import { act } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { PollenReferenceAdminListItem } from 'shared-schemas';
import {
  flushPromises,
  mountRoot,
  setInputValue,
} from '@/test/react-test-utils';
import { PollenRecordFormDialog } from './components/pollen-record-form-dialog';

const createRecord = (): PollenReferenceAdminListItem => ({
  id: 'record-1',
  plantName: 'Willow',
  scientificName: 'Salix spp.',
  colorLabel: 'pale yellow',
  colorGroup: 'yellow',
  hexColor: '#facc15',
  notes: null,
  active: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
  regions: [
    {
      region: 'EUROPE',
      seasons: ['spring'],
      notes: null,
    },
  ],
});

const createMutation = vi.fn();
const updateMutation = vi.fn();

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = ResizeObserverMock as typeof ResizeObserver;
}

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { defaultValue?: string }) =>
      options?.defaultValue ?? key,
  }),
}));

vi.mock('@/api/hooks/useAdminPollenReferences', () => ({
  useCreateAdminPollenReference: () => ({
    mutateAsync: createMutation,
    isPending: false,
  }),
  useUpdateAdminPollenReference: () => ({
    mutateAsync: updateMutation,
    isPending: false,
  }),
}));

function renderDialog(record: PollenReferenceAdminListItem | null) {
  const queryClient = new QueryClient();

  return mountRoot(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <PollenRecordFormDialog open onOpenChange={() => undefined} record={record} />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

function getInput(selector: string) {
  const input = document.body.querySelector<HTMLInputElement>(selector);
  if (!input) {
    throw new Error(`Missing input: ${selector}`);
  }

  return input;
}

function getCheckboxByLabel(labelText: string) {
  const label = Array.from(document.body.querySelectorAll('label')).find(node =>
    node.textContent?.includes(labelText),
  );

  const checkbox = label?.querySelector('[role="checkbox"]') as HTMLButtonElement | null;
  if (!checkbox) {
    throw new Error(`Missing checkbox for label: ${labelText}`);
  }

  return checkbox;
}

function getButtonByText(text: string) {
  const button = Array.from(document.body.querySelectorAll('button')).find(btn =>
    btn.textContent?.includes(text),
  ) as HTMLButtonElement | undefined;

  if (!button) {
    throw new Error(`Missing button: ${text}`);
  }

  return button;
}

function submitForm() {
  const form = document.body.querySelector('form');
  if (!form) {
    throw new Error('Missing form');
  }

  form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
}

describe('PollenRecordFormDialog', () => {
  beforeEach(() => {
    createMutation.mockReset();
    updateMutation.mockReset();
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('submits create payload with region mappings and color picker sync', async () => {
    createMutation.mockResolvedValue({ id: 'created' });

    const mounted = renderDialog(null);

    act(() => {
      setInputValue(getInput('input[name="plantName"]'), 'Clover');
      setInputValue(getInput('input[name="scientificName"]'), 'Trifolium repens');
      setInputValue(getInput('input[name="colorLabel"]'), 'bright yellow');
      setInputValue(getInput('input[type="color"]'), '#00ff00');
    });

    await act(async () => {
      submitForm();
      await flushPromises();
    });

    expect(createMutation).toHaveBeenCalledTimes(1);
    expect(createMutation.mock.calls[0][0]).toMatchObject({
      plantName: 'Clover',
      scientificName: 'Trifolium repens',
      colorLabel: 'bright yellow',
      colorGroup: 'yellow',
      hexColor: '#00ff00',
      active: true,
      regions: expect.arrayContaining([
        expect.objectContaining({ region: 'UK_AND_IRELAND' }),
      ]),
    });

    mounted.unmount();
  });

  it('pre-fills edit values and submits update payload', async () => {
    updateMutation.mockResolvedValue({ id: 'updated' });

    const mounted = renderDialog(createRecord());

    expect(getInput('input[name="plantName"]').value).toBe('Willow');

    await act(async () => {
      submitForm();
      await flushPromises();
    });

    expect(updateMutation).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'record-1',
        plantName: 'Willow',
      }),
    );

    mounted.unmount();
  });

  it('shows an error when no seasons are selected', async () => {
    createMutation.mockResolvedValue({ id: 'created' });

    const mounted = renderDialog(null);

    act(() => {
      getCheckboxByLabel('spring').click();
    });

    await act(async () => {
      submitForm();
      await flushPromises();
    });

    expect(document.body.textContent).toMatch(/expected array|Too small|at least/i);

    mounted.unmount();
  });

  it('shows duplicate region validation errors', async () => {
    createMutation.mockResolvedValue({ id: 'created' });

    const mounted = renderDialog(null);

    act(() => {
      getButtonByText('actions.add').click();
    });

    await act(async () => {
      submitForm();
      await flushPromises();
    });

    expect(document.body.textContent).toContain('Duplicate region mapping: UK_AND_IRELAND');

    mounted.unmount();
  });
});
