/**
 * Auto-init entry point for the IO Detector bundle.
 *
 * Side-effecting module: when loaded into the page (main world), it
 * mounts the <IODetector /> React component into a fresh host element
 * and exposes a destroy handle via `window.__IO_DETECTOR__`.
 *
 * Used by the Chrome extension launcher (apps/extension).
 */
import { createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import {
  createIODetectorInstance,
  IODetectorView,
  type IODetectorInstance,
} from './io-detector';

declare global {
  interface Window {
    __IO_DETECTOR__?: {
      destroy: () => void;
    };
  }
}

function mountUI(host: HTMLElement, instance: IODetectorInstance): Root {
  const root = createRoot(host);
  root.render(createElement(IODetectorView, { registry: instance.registry }));
  return root;
}

function afterPageHydration(callback: VoidFunction): VoidFunction {
  let timeout: number | null = null;

  const schedule = () => {
    timeout = window.setTimeout(callback, 0);
  };

  if (document.readyState === 'complete') {
    schedule();
  } else {
    window.addEventListener('load', schedule, { once: true });
  }

  return () => {
    window.removeEventListener('load', schedule);
    if (timeout !== null) window.clearTimeout(timeout);
  };
}

function init(): void {
  if (
    typeof window === 'undefined' ||
    typeof document === 'undefined' ||
    window.__IO_DETECTOR__
  ) {
    return;
  }

  const instance = createIODetectorInstance();
  const host = document.createElement('div');
  host.id = 'io-detector-host';
  let root: Root | null = null;
  let cancelMount: VoidFunction | null = null;

  const attachHost = () => {
    if (!document.body || root) return;
    document.body.appendChild(host);
    root = mountUI(host, instance);
  };

  cancelMount = afterPageHydration(attachHost);

  window.__IO_DETECTOR__ = {
    destroy: () => {
      try {
        cancelMount?.();
        root?.unmount();
        instance.destroy();
      } finally {
        host.remove();
        delete window.__IO_DETECTOR__;
      }
    },
  };
}

init();
