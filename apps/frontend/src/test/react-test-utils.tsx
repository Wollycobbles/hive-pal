import { act, type ReactElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';

export type MountedRoot = {
  container: HTMLDivElement;
  root: Root;
  unmount: () => void;
};

export function mountRoot(element: ReactElement): MountedRoot {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);

  act(() => {
    root.render(element);
  });

  return {
    container,
    root,
    unmount: () => {
      act(() => {
        root.unmount();
      });
      container.remove();
    },
  };
}

export function setInputValue(input: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    'value',
  )?.set;

  setter?.call(input, value);
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
}

export function flushPromises() {
  return new Promise(resolve => setTimeout(resolve, 0));
}

export function waitForCondition(predicate: () => boolean, timeout = 2000) {
  return new Promise<void>((resolve, reject) => {
    const started = Date.now();

    const tick = () => {
      if (predicate()) {
        resolve();
        return;
      }

      if (Date.now() - started > timeout) {
        reject(new Error('Timed out waiting for condition'));
        return;
      }

      setTimeout(tick, 10);
    };

    tick();
  });
}
