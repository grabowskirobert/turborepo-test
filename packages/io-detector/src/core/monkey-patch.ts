/**
 * Core Monkey Patching Module
 * Intercepts IntersectionObserver constructor to track all observer instances
 *
 * This module is pure TypeScript - no React dependencies
 */
import type { ObserverMetadata, ObserverRegistryPort } from './types';

// Store original IntersectionObserver for restoration
let OriginalIntersectionObserver: typeof IntersectionObserver | null = null;
let isPatched = false;
let observerIdCounter = 0;

// WeakMap to track observer instance -> metadata ID mapping
const observerToId = new WeakMap<IntersectionObserver, string>();

function generateId(): string {
  return `io_${Date.now()}_${++observerIdCounter}`;
}

function captureStackTrace(): string | undefined {
  try {
    const stack = new Error().stack;
    if (!stack) return undefined;
    // Skip first 3 lines (Error, captureStackTrace, PatchedIntersectionObserver)
    return stack.split('\n').slice(3).join('\n');
  } catch {
    return undefined;
  }
}

/**
 * Initialize monkey patching of IntersectionObserver
 * @param registry - Injected storage port (Dependency Inversion)
 */
export function initMonkeyPatch(registry: ObserverRegistryPort): void {
  if (isPatched) {
    console.warn('[IODetector] Already patched. Skipping.');
    return;
  }

  if (typeof window === 'undefined' || !window.IntersectionObserver) {
    console.warn('[IODetector] IntersectionObserver not available.');
    return;
  }

  OriginalIntersectionObserver = window.IntersectionObserver;

  const PatchedIntersectionObserver = function (
    this: IntersectionObserver,
    callback: IntersectionObserverCallback,
    options?: IntersectionObserverInit,
  ): IntersectionObserver {
    // Create real observer instance
    const instance = new OriginalIntersectionObserver!(callback, options);

    const id = generateId();
    observerToId.set(instance, id);

    const metadata: ObserverMetadata = {
      id,
      instance,
      callback,
      options,
      targets: new Set(),
      isZombie: false,
      createdAt: Date.now(),
      stackTrace: captureStackTrace(),
    };

    // Patch observe method
    const originalObserve = instance.observe.bind(instance);
    instance.observe = (target: Element): void => {
      metadata.targets.add(target);
      registry.set(id, { ...metadata });
      originalObserve(target);
    };

    // Patch unobserve method
    const originalUnobserve = instance.unobserve.bind(instance);
    instance.unobserve = (target: Element): void => {
      metadata.targets.delete(target);
      registry.set(id, { ...metadata });
      originalUnobserve(target);
    };

    // Patch disconnect method
    const originalDisconnect = instance.disconnect.bind(instance);
    instance.disconnect = (): void => {
      registry.remove(id);
      originalDisconnect();
    };

    // Register observer
    registry.set(id, metadata);

    return instance;
  } as unknown as typeof IntersectionObserver;

  // Copy static properties and prototype
  PatchedIntersectionObserver.prototype =
    OriginalIntersectionObserver.prototype;
  Object.setPrototypeOf(
    PatchedIntersectionObserver,
    OriginalIntersectionObserver,
  );

  // Replace global
  window.IntersectionObserver = PatchedIntersectionObserver;
  isPatched = true;

  console.debug('[IODetector] Monkey patch initialized.');
}

/**
 * Restore original IntersectionObserver - HMR safe teardown
 */
export function destroyMonkeyPatch(): void {
  if (!isPatched || !OriginalIntersectionObserver) {
    return;
  }

  window.IntersectionObserver = OriginalIntersectionObserver;
  OriginalIntersectionObserver = null;
  isPatched = false;
  observerIdCounter = 0;

  console.debug('[IODetector] Monkey patch destroyed.');
}

/**
 * Check if monkey patching is currently active
 */
export function isPatchActive(): boolean {
  return isPatched;
}
