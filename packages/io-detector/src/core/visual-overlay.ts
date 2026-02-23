/**
 * FEAT-003 — Dual-Loop Architecture
 *
 * Pure TS module managing two independent loops:
 *   Loop A (Priority Loop) — throttled every ~200ms:
 *     Calculates metrics, sorts Smart Queue, updates visible IDs list in store.
 *   Loop B (Render Loop) — requestAnimationFrame (every frame):
 *     Reads the visible IDs list, updates CSS positions, applies Cheap Cull.
 *
 * @see feat-003.md § c. Performance Architecture (Dual-Loop)
 */
import type { ObserverRegistryPort, OverlayRect } from './types';
import { LOOP_A_INTERVAL_MS } from './types';

// ---------------------------------------------------------------------------
// Module state
// ---------------------------------------------------------------------------

let loopATimerId: ReturnType<typeof setTimeout> | null = null;
let loopBRafId: number | null = null;
let registryRef: ObserverRegistryPort | null = null;

/**
 * Callback invoked by Loop A when the visible overlay set changes.
 * Injected at start time so the core module stays React-free.
 */
type OnVisibleIdsUpdate = (ids: string[]) => void;
let onVisibleIdsUpdate: OnVisibleIdsUpdate | null = null;

/**
 * Callback invoked by Loop B with updated overlay rects each frame.
 * Injected at start time.
 */
type OnRectsUpdate = (rects: OverlayRect[]) => void;
let onRectsUpdate: OnRectsUpdate | null = null;

// ---------------------------------------------------------------------------
// isElementInViewport — Cheap Cull
// ---------------------------------------------------------------------------

/**
 * Lightweight viewport check for the Cheap Cull step inside Loop B.
 * Returns `true` if any part of the element is within the visible viewport.
 *
 * @see feat-003.md § c — "Cheap Cull"
 *
 * TODO(feat-003): implement
 *   const rect = el.getBoundingClientRect();
 *   return (
 *     rect.bottom > 0 &&
 *     rect.right > 0 &&
 *     rect.top < window.innerHeight &&
 *     rect.left < window.innerWidth
 *   );
 */
export function isElementInViewport(element: Element): boolean {
  // TODO(feat-003): implement
  return false;
}

// ---------------------------------------------------------------------------
// Loop A — Priority Loop
// ---------------------------------------------------------------------------

/**
 * Single tick of Loop A.
 *
 * TODO(feat-003): implement
 *   1. Read registry snapshot: registryRef.getAll()
 *   2. Determine safety tier (determineSafetyTier)
 *   3. If visualsEnabled === false and no forceShowId → emit empty ids, return
 *   4. Build Smart Queue (buildSmartQueue) → top 30 entries
 *   5. Extract ids: entries.map(e => `${e.observerId}::${e.targetIndex}`)
 *   6. Invoke onVisibleIdsUpdate(ids)
 */
function tickLoopA(): void {
  // TODO(feat-003): implement
}

/**
 * Start Loop A. Uses `requestIdleCallback` (with setTimeout fallback)
 * to schedule ticks every LOOP_A_INTERVAL_MS.
 *
 * @param registry           - Injected registry port (Dependency Inversion)
 * @param visibleIdsCallback - Invoked when visible overlay set changes.
 *
 * TODO(feat-003): implement scheduling
 *   - Store registry ref
 *   - Use requestIdleCallback → tickLoopA → setTimeout(scheduleNext, LOOP_A_INTERVAL_MS)
 *   - Fallback: setInterval(tickLoopA, LOOP_A_INTERVAL_MS)
 */
export function startLoopA(
  registry: ObserverRegistryPort,
  visibleIdsCallback: OnVisibleIdsUpdate,
): void {
  // TODO(feat-003): implement
  registryRef = registry;
  onVisibleIdsUpdate = visibleIdsCallback;
  void tickLoopA;
  void LOOP_A_INTERVAL_MS;
}

/**
 * Stop Loop A and clean up timers.
 *
 * TODO(feat-003): implement
 *   - Clear timeout / interval
 *   - Null out refs
 */
export function stopLoopA(): void {
  // TODO(feat-003): implement
  if (loopATimerId !== null) {
    clearTimeout(loopATimerId as unknown as number);
    loopATimerId = null;
  }
  registryRef = null;
  onVisibleIdsUpdate = null;
}

// ---------------------------------------------------------------------------
// Loop B — Render Loop (rAF)
// ---------------------------------------------------------------------------

/**
 * Current set of visible IDs produced by Loop A.
 * Loop B reads this to know which overlays to position.
 */
let currentVisibleIds: string[] = [];

/**
 * Update the visible IDs list (called by Loop A callback bridge in stores).
 */
export function setVisibleIds(ids: string[]): void {
  currentVisibleIds = ids;
}

/**
 * Single tick of Loop B.
 *
 * TODO(feat-003): implement
 *   1. For each id in currentVisibleIds:
 *      a. Parse observerId & targetIndex from id
 *      b. Look up target element from registry
 *      c. Cheap Cull: isElementInViewport(target)
 *      d. Compute OverlayRect { targetRect, rootMarginRect, intersectionRect, isInViewport }
 *   2. Include forceShowId rect (if any) even if not in visible set
 *   3. Invoke onRectsUpdate(rects)
 *   4. Schedule next frame: loopBRafId = requestAnimationFrame(tickLoopB)
 */
function tickLoopB(): void {
  // TODO(feat-003): implement
  void currentVisibleIds;
  loopBRafId = requestAnimationFrame(tickLoopB);
}

/**
 * Start Loop B (requestAnimationFrame-based render loop).
 *
 * @param rectsCallback - Invoked every frame with updated OverlayRect[].
 *
 * TODO(feat-003): implement
 *   - Store callback ref
 *   - Kick off first rAF
 */
export function startLoopB(rectsCallback: OnRectsUpdate): void {
  // TODO(feat-003): implement
  onRectsUpdate = rectsCallback;
  void tickLoopB;
}

/**
 * Stop Loop B and cancel pending rAF.
 */
export function stopLoopB(): void {
  if (loopBRafId !== null) {
    cancelAnimationFrame(loopBRafId);
    loopBRafId = null;
  }
  onRectsUpdate = null;
  currentVisibleIds = [];
}
