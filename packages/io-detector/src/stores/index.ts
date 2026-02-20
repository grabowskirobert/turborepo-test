/**
 * Nanostores for IODetector state management
 * Bridge between Pure TS Core and React UI
 */
import { map, atom } from 'nanostores';
import type {
  ObserverMetadata,
  UIConfig,
  ObserverRegistryPort,
  IntersectionRatioMap,
} from '@/core';

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
  expandedGroups: new Set(),
});

// ---------------------------------------------------------------------------
// FEAT-002 stores
// ---------------------------------------------------------------------------

/**
 * Per-target intersection ratios.
 * Key format: "${observerId}::${targetIndex}"
 * Updated on every IntersectionObserver callback tick.
 */
export const $intersectionRatios = map<IntersectionRatioMap>({});

/**
 * Running count of thumbnails rendered this session.
 * @see feat-002.md § C.1 — max 50 thumbnails per session.
 */
export const MAX_THUMBNAILS = 50;
export const $thumbnailCount = atom<number>(0);

// ---------------------------------------------------------------------------
// Batched update helpers
// ---------------------------------------------------------------------------

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

function batchedSetObserver(id: string, metadata: ObserverMetadata): void {
  pendingUpdates.set(id, metadata);
  if (rafId === null) {
    rafId = requestAnimationFrame(flushUpdates);
  }
}

function batchedRemoveObserver(id: string): void {
  pendingUpdates.set(id, null);
  if (rafId === null) {
    rafId = requestAnimationFrame(flushUpdates);
  }
}

function markAsZombie(id: string): void {
  const observer = $observers.get()[id];
  if (observer && !observer.isZombie) {
    batchedSetObserver(id, { ...observer, isZombie: true });
  }
}

// ---------------------------------------------------------------------------
// FEAT-002 helpers
// ---------------------------------------------------------------------------

/**
 * Update intersection ratio for a specific observer target.
 * Key: "${observerId}::${targetIndex}"
 *
 * TODO(feat-002): call this from monkey-patch callback wrapper
 */
export function updateRatio(
  observerId: string,
  targetIndex: number,
  ratio: number,
): void {
  const key = `${observerId}::${targetIndex}`;
  $intersectionRatios.setKey(key, ratio);
}

/**
 * Increment thumbnail session counter.
 * Returns true if the limit has NOT been reached (thumbnail should render).
 */
export function incrementThumbnailCount(): boolean {
  const current = $thumbnailCount.get();
  if (current >= MAX_THUMBNAILS) return false;
  $thumbnailCount.set(current + 1);
  return true;
}

// ---------------------------------------------------------------------------
// Factory & reset
// ---------------------------------------------------------------------------

/**
 * Factory: Creates an ObserverRegistryPort backed by nanostores.
 * Injected into Core modules at the composition root (IODetector.tsx).
 */
export function createRegistryAdapter(): ObserverRegistryPort {
  return {
    set: batchedSetObserver,
    remove: batchedRemoveObserver,
    getAll: () => $observers.get(),
    markZombie: markAsZombie,
    // FEAT-002: ratio update hook
    updateRatio,
  };
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
    expandedGroups: new Set(),
  });
  // FEAT-002
  $intersectionRatios.set({});
  $thumbnailCount.set(0);
}
