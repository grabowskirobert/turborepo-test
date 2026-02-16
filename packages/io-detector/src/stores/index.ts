/**
 * Nanostores for IODetector state management
 * Bridge between Pure TS Core and React UI
 */
import { map, atom } from 'nanostores';
import type { ObserverMetadata, UIConfig } from '@/core';

/**
 * Registry of active IntersectionObserver instances
 * Core writes, React reads via useStore()
 */
export const $observers = map<Record<string, ObserverMetadata>>({});

/**
 * UI configuration state
 */
export const $uiConfig = atom<UIConfig>({
  collapsed: false,
  inspectionMode: 'none',
  selectedObserverId: null,
});

/**
 * Batched update helper - throttles store writes to avoid React re-render thrashing
 * Uses requestAnimationFrame for smooth UI updates
 */
const pendingUpdates: Map<string, ObserverMetadata | null> = new Map();
let rafId: number | null = null;

function flushUpdates(): void {
  if (pendingUpdates.size === 0) return;

  const currentObservers = $observers.get();
  const newObservers = { ...currentObservers };

  pendingUpdates.forEach((metadata, id) => {
    if (metadata === null) {
      delete newObservers[id];
    } else {
      newObservers[id] = metadata;
    }
  });

  $observers.set(newObservers);
  pendingUpdates.clear();
  rafId = null;
}

export function batchedSetObserver(
  id: string,
  metadata: ObserverMetadata,
): void {
  pendingUpdates.set(id, metadata);
  if (rafId === null) {
    rafId = requestAnimationFrame(flushUpdates);
  }
}

export function batchedRemoveObserver(id: string): void {
  pendingUpdates.set(id, null);
  if (rafId === null) {
    rafId = requestAnimationFrame(flushUpdates);
  }
}

export function markAsZombie(id: string): void {
  const observer = $observers.get()[id];
  if (observer && !observer.isZombie) {
    batchedSetObserver(id, { ...observer, isZombie: true });
  }
}

/**
 * Reset all stores - used during destroy
 */
export function resetStores(): void {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  pendingUpdates.clear();
  $observers.set({});
  $uiConfig.set({
    collapsed: false,
    inspectionMode: 'none',
    selectedObserverId: null,
  });
}
