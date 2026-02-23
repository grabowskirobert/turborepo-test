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
  SafetyTierState,
  VisualOverlayConfig,
  OverlayRect,
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
// FEAT-003 stores — Visual Debug Overlay
// ---------------------------------------------------------------------------

/**
 * Current safety tier state (computed by Loop A via determineSafetyTier).
 * @see feat-003.md § d
 */
export const $safetyTier = atom<SafetyTierState>({
  tier: 1,
  totalObservers: 0,
  statusMessage: '🟢 System Active',
  areVisualsEnabled: true,
});

/**
 * Visual overlay user configuration (manual toggle + force-show).
 * @see feat-003.md § f — User Control & Overrides
 */
export const $visualOverlayConfig = atom<VisualOverlayConfig>({
  userToggledOn: null,
  forceShowId: null,
});

/**
 * The set of overlay IDs currently selected by Loop A's Smart Queue.
 * Loop B reads this list each frame to update CSS positions.
 * Format: "${observerId}::${targetIndex}"
 */
export const $visibleOverlayIds = atom<string[]>([]);

/**
 * Computed overlay rects for the current frame (written by Loop B).
 * React reads this to position overlay DOM elements.
 */
export const $overlayRects = atom<OverlayRect[]>([]);

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
// FEAT-003 helpers
// ---------------------------------------------------------------------------

/**
 * Toggle visual overlay ON/OFF manually.
 * Hard limit of 30 overlays still applies regardless.
 * @see feat-003.md § f — Manual Toggle
 *
 * TODO(feat-003): implement
 *   - Update $visualOverlayConfig.userToggledOn
 *   - In Tier 3, toggling ON should still cap at 30 overlays
 */
export function toggleVisualOverlay(): void {
  // TODO(feat-003): implement
  const config = $visualOverlayConfig.get();
  void config;
}

/**
 * Set the force-show ID (Spot Check) — hover on a panel row triggers this.
 * Temporarily renders one specific overlay, ignoring all tier/queue limits.
 * Pass `null` to clear.
 * @see feat-003.md § f — Spot Check (Force-Show)
 *
 * TODO(feat-003): implement
 *   - Update $visualOverlayConfig.forceShowId
 *   - Loop B will pick this up on next frame tick
 */
export function setForceShowId(_id: string | null): void {
  // TODO(feat-003): implement
}

/**
 * Bridge callback for Loop A → store: updates $visibleOverlayIds.
 *
 * TODO(feat-003): implement
 *   - $visibleOverlayIds.set(ids)
 */
export function updateVisibleOverlayIds(_ids: string[]): void {
  // TODO(feat-003): implement
}

/**
 * Bridge callback for Loop B → store: updates $overlayRects.
 *
 * TODO(feat-003): implement
 *   - $overlayRects.set(rects)
 */
export function updateOverlayRects(_rects: OverlayRect[]): void {
  // TODO(feat-003): implement
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
  // FEAT-003
  $safetyTier.set({
    tier: 1,
    totalObservers: 0,
    statusMessage: '🟢 System Active',
    areVisualsEnabled: true,
  });
  $visualOverlayConfig.set({ userToggledOn: null, forceShowId: null });
  $visibleOverlayIds.set([]);
  $overlayRects.set([]);
}
