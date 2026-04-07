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
import type {
  ObserverMetadata,
  ObserverRegistryPort,
  OverlayRect,
  SafetyTierState,
  VisualOverlayConfig,
} from './types';
import { LOOP_A_INTERVAL_MS } from './types';
import { determineSafetyTier } from './safety-tiers';
import { buildSmartQueue } from './smart-queue';

// ---------------------------------------------------------------------------
// Module state
// ---------------------------------------------------------------------------

let loopATimerId: ReturnType<typeof setTimeout> | null = null;
let loopBRafId: number | null = null;
let _registryRef: ObserverRegistryPort | null = null;
let _hasEnteredTier3 = false;

type OnVisibleIdsUpdate = (ids: string[]) => void;
let _onVisibleIdsUpdate: OnVisibleIdsUpdate | null = null;

type OnRectsUpdate = (rects: OverlayRect[]) => void;
let _onRectsUpdate: OnRectsUpdate | null = null;

type GetConfigFn = () => VisualOverlayConfig;
let _getConfig: GetConfigFn | null = null;

type OnSafetyTierUpdate = (tier: SafetyTierState) => void;
let _onSafetyTierUpdate: OnSafetyTierUpdate | null = null;

type OnEnterTier3 = () => void;
let _onEnterTier3: OnEnterTier3 | null = null;

// ---------------------------------------------------------------------------
// parseRootMarginPx (shared utility)
// ---------------------------------------------------------------------------

function parseRootMarginPx(rootMargin?: string): {
  top: number;
  right: number;
  bottom: number;
  left: number;
} {
  const zero = { top: 0, right: 0, bottom: 0, left: 0 };
  if (!rootMargin) return zero;
  const parts = rootMargin
    .trim()
    .split(/\s+/)
    .map((v) => parseFloat(v) || 0);
  switch (parts.length) {
    case 1:
      return {
        top: parts[0] ?? 0,
        right: parts[0] ?? 0,
        bottom: parts[0] ?? 0,
        left: parts[0] ?? 0,
      };
    case 2:
      return {
        top: parts[0] ?? 0,
        right: parts[1] ?? 0,
        bottom: parts[0] ?? 0,
        left: parts[1] ?? 0,
      };
    case 3:
      return {
        top: parts[0] ?? 0,
        right: parts[1] ?? 0,
        bottom: parts[2] ?? 0,
        left: parts[1] ?? 0,
      };
    case 4:
      return {
        top: parts[0] ?? 0,
        right: parts[1] ?? 0,
        bottom: parts[2] ?? 0,
        left: parts[3] ?? 0,
      };
    default:
      return zero;
  }
}

// ---------------------------------------------------------------------------
// isElementInViewport — Cheap Cull
// ---------------------------------------------------------------------------

/**
 * Lightweight viewport check for the Cheap Cull step inside Loop B.
 * @see feat-003.md § c — "Cheap Cull"
 */
export function isElementInViewport(element: Element): boolean {
  const rect = element.getBoundingClientRect();
  return (
    rect.bottom > 0 &&
    rect.right > 0 &&
    rect.top < window.innerHeight &&
    rect.left < window.innerWidth
  );
}

// ---------------------------------------------------------------------------
// Rect helpers for Loop B
// ---------------------------------------------------------------------------

function computeRootMarginRect(observer: ObserverMetadata): DOMRect | null {
  const rm = observer.options?.rootMargin;
  if (!rm || rm === '0px' || rm === '0px 0px 0px 0px') return null;
  const m = parseRootMarginPx(rm);
  return new DOMRect(
    -m.left,
    -m.top,
    window.innerWidth + m.left + m.right,
    window.innerHeight + m.top + m.bottom,
  );
}

function computeIntersectionRect(targetRect: DOMRect): DOMRect | null {
  const top = Math.max(0, targetRect.top);
  const left = Math.max(0, targetRect.left);
  const bottom = Math.min(window.innerHeight, targetRect.bottom);
  const right = Math.min(window.innerWidth, targetRect.right);
  if (bottom <= top || right <= left) return null;
  return new DOMRect(left, top, right - left, bottom - top);
}

// ---------------------------------------------------------------------------
// Loop A — Priority Loop
// ---------------------------------------------------------------------------

function tickLoopA(): void {
  if (!_registryRef) return;

  const observers = _registryRef.getAll();
  const config = _getConfig?.() ?? { userToggledOn: null, forceShowId: null };
  const ratios = _registryRef.getRatios?.() ?? {};

  const tierState = determineSafetyTier(observers, config.userToggledOn);

  // Hysteresis: first time entering Tier 3 with no user override → lock to OFF
  if (
    tierState.tier === 3 &&
    config.userToggledOn === null &&
    !_hasEnteredTier3
  ) {
    _hasEnteredTier3 = true;
    _onEnterTier3?.();
  }

  _onSafetyTierUpdate?.(tierState);

  if (!tierState.areVisualsEnabled && config.forceShowId === null) {
    setVisibleIds([]);
    _onVisibleIdsUpdate?.([]);
    return;
  }

  const entries = buildSmartQueue(observers, ratios);
  const ids = entries.map((e) => `${e.observerId}::${e.targetIndex}`);

  setVisibleIds(ids);
  _onVisibleIdsUpdate?.(ids);
}

function scheduleNextLoopA(): void {
  loopATimerId = setTimeout(() => {
    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(() => {
        tickLoopA();
        scheduleNextLoopA();
      });
    } else {
      tickLoopA();
      scheduleNextLoopA();
    }
  }, LOOP_A_INTERVAL_MS);
}

export interface LoopAOptions {
  getConfig?: GetConfigFn;
  onSafetyTierUpdate?: OnSafetyTierUpdate;
  /** Called when Tier 3 is entered for the first time without a user override. */
  onEnterTier3?: OnEnterTier3;
}

export function startLoopA(
  registry: ObserverRegistryPort,
  visibleIdsCallback: OnVisibleIdsUpdate,
  options?: LoopAOptions,
): void {
  _registryRef = registry;
  _onVisibleIdsUpdate = visibleIdsCallback;
  _getConfig = options?.getConfig ?? null;
  _onSafetyTierUpdate = options?.onSafetyTierUpdate ?? null;
  _onEnterTier3 = options?.onEnterTier3 ?? null;
  scheduleNextLoopA();
}

export function stopLoopA(): void {
  if (loopATimerId !== null) {
    clearTimeout(loopATimerId as unknown as number);
    loopATimerId = null;
  }
  _registryRef = null;
  _onVisibleIdsUpdate = null;
  _getConfig = null;
  _onSafetyTierUpdate = null;
  _onEnterTier3 = null;
  _hasEnteredTier3 = false;
}

// ---------------------------------------------------------------------------
// Loop B — Render Loop (rAF)
// ---------------------------------------------------------------------------

let currentVisibleIds: string[] = [];

export function setVisibleIds(ids: string[]): void {
  currentVisibleIds = ids;
}

function tickLoopB(): void {
  if (!_registryRef) {
    loopBRafId = requestAnimationFrame(tickLoopB);
    return;
  }

  const observers = _registryRef.getAll();
  const config = _getConfig?.() ?? { userToggledOn: null, forceShowId: null };
  const rects: OverlayRect[] = [];

  for (const id of currentVisibleIds) {
    const sepIdx = id.lastIndexOf('::');
    if (sepIdx === -1) continue;
    const observerId = id.slice(0, sepIdx);
    const targetIndex = parseInt(id.slice(sepIdx + 2), 10);
    const observer = observers[observerId];
    if (!observer) continue;

    const targets = Array.from(observer.targets);
    const target = targets[targetIndex];
    if (!target) continue;

    const inViewport = isElementInViewport(target);
    const targetRect = target.getBoundingClientRect();
    const rootMarginRect = computeRootMarginRect(observer);
    const intersectionRect = inViewport
      ? computeIntersectionRect(targetRect)
      : null;

    rects.push({
      id,
      targetRect,
      rootMarginRect,
      intersectionRect,
      isInViewport: inViewport,
    });
  }

  // Force-show overlay (Spot Check) — rendered even if not in the visible set
  const { forceShowId } = config;
  if (forceShowId && !currentVisibleIds.includes(forceShowId)) {
    const sepIdx = forceShowId.lastIndexOf('::');
    if (sepIdx !== -1) {
      const observerId = forceShowId.slice(0, sepIdx);
      const targetIndex = parseInt(forceShowId.slice(sepIdx + 2), 10);
      const observer = observers[observerId];
      if (observer) {
        const target = Array.from(observer.targets)[targetIndex];
        if (target) {
          const targetRect = target.getBoundingClientRect();
          rects.push({
            id: forceShowId,
            targetRect,
            rootMarginRect: computeRootMarginRect(observer),
            intersectionRect: computeIntersectionRect(targetRect),
            isInViewport: true, // force-show bypasses Cheap Cull
          });
        }
      }
    }
  }

  _onRectsUpdate?.(rects);
  loopBRafId = requestAnimationFrame(tickLoopB);
}

export function startLoopB(rectsCallback: OnRectsUpdate): void {
  _onRectsUpdate = rectsCallback;
  loopBRafId = requestAnimationFrame(tickLoopB);
}

export function stopLoopB(): void {
  if (loopBRafId !== null) {
    cancelAnimationFrame(loopBRafId);
    loopBRafId = null;
  }
  _onRectsUpdate = null;
  currentVisibleIds = [];
}
