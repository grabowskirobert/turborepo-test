'use client';

/**
 * IODetector - Main React Component
 *
 * The single public API for the Intersection Observer Detector.
 * Manages lifecycle, safety guards, and singleton enforcement.
 */
import { useEffect, useRef, useState, StrictMode, type ReactNode } from 'react';
import {
  initMonkeyPatch,
  destroyMonkeyPatch,
  startZombiePolling,
  stopZombiePolling,
} from './core';
import type { ObserverRegistryPort } from './core';
import { resetStores, createRegistryAdapter } from './stores';
import {
  ShadowRoot,
  ErrorBoundary,
  DetectorUI,
  VisualOverlay,
} from './components';

// Singleton enforcement - module-level instance tracking
let activeInstanceId: symbol | null = null;

interface IODetectorInstance {
  id: symbol;
  registry: ObserverRegistryPort;
  destroy: VoidFunction;
}

function createInstance(): IODetectorInstance {
  const id = Symbol('io-detector-instance');

  // Destroy previous instance if exists (HMR safety)
  if (activeInstanceId !== null) {
    console.debug(
      '[IODetector] Destroying previous instance for singleton enforcement.',
    );
    cleanup();
  }

  activeInstanceId = id;

  // Initialize core logic with injected registry (Dependency Inversion)
  const registry = createRegistryAdapter();
  initMonkeyPatch(registry);
  startZombiePolling(registry);

  const destroy = (): void => {
    if (activeInstanceId !== id) return; // Already replaced
    cleanup();
  };

  return { id, registry, destroy };
}

function cleanup(): void {
  stopZombiePolling();
  destroyMonkeyPatch();
  resetStores();
  activeInstanceId = null;
}

/**
 * IODetector React Component
 *
 * Drop-in component for detecting and debugging IntersectionObserver usage.
 *
 * @example
 * ```tsx
 * import { IODetector } from '@repo/io-detector';
 *
 * function App() {
 *   return (
 *     <>
 *       <IODetector />
 *       <YourApp />
 *     </>
 *   );
 * }
 * ```
 *
 * Features:
 * - Auto-disabled in production (tree-shakeable)
 * - Shadow DOM isolation (no style conflicts)
 * - HMR-safe (proper cleanup on hot reload)
 * - Singleton enforcement (only one instance active)
 */
export function IODetector(): ReactNode {
  const instanceRef = useRef<IODetectorInstance | null>(null);
  // Lift registry to state so VisualOverlay mounts after useEffect runs
  const [registry, setRegistry] = useState<ObserverRegistryPort | null>(null);

  // Lifecycle management
  useEffect(() => {
    // Safety Guard: Browser compatibility
    if (typeof window === 'undefined' || !window.IntersectionObserver) {
      console.warn(
        '[IODetector] IntersectionObserver API not available. Detector disabled.',
      );
      return;
    }

    instanceRef.current = createInstance();
    setRegistry(instanceRef.current.registry);

    console.debug('[IODetector] Mounted and active.');

    return () => {
      instanceRef.current?.destroy();
      instanceRef.current = null;
      setRegistry(null);
      console.debug('[IODetector] Unmounted and cleaned up.');
    };
  }, []);

  // Render UI in isolated Shadow DOM
  return (
    <ShadowRoot>
      <StrictMode>
        <ErrorBoundary>
          {/* FEAT-003: VisualOverlay — z-index: 10 (below Panel) */}
          {registry && <VisualOverlay registry={registry} />}
          <DetectorUI />
        </ErrorBoundary>
      </StrictMode>
    </ShadowRoot>
  );
}
