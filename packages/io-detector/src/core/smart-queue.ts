/**
 * FEAT-003 — Smart Queue (Priority Sorting)
 *
 * Selects the Top 30 overlays to render in Tier 2 and Tier 3 (override).
 * Sorting is based on a weighted criteria system:
 *   Tier A (Critical):   isIntersecting === true
 *   Tier B (Proximal):   inside rootMargin but not intersecting
 *   Tier C (Focal):      sorted by proximity to screen center
 *   Tier D (Background): off-screen elements
 * Tie-breaker: smallest surface area (W×H) wins.
 *
 * @see feat-003.md § e. The "Smart Queue"
 */
import type {
  ObserverMetadata,
  IntersectionRatioMap,
  SmartQueueEntry,
  SmartQueuePriority,
} from './types';
import { MAX_VISIBLE_OVERLAYS } from './types';

// ---------------------------------------------------------------------------
// parseRootMarginPx (private)
// ---------------------------------------------------------------------------

/** Parse CSS rootMargin string → px offsets. Percentages treated as 0. */
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
// classifyTarget (private)
// ---------------------------------------------------------------------------

function classifyTarget(
  target: Element,
  observer: ObserverMetadata,
  observerId: string,
  targetIndex: number,
  ratios: IntersectionRatioMap,
): {
  priority: SmartQueuePriority;
  distanceToCenter: number;
  surfaceArea: number;
  isIntersecting: boolean;
  isInRootMargin: boolean;
} {
  const rect = target.getBoundingClientRect();

  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;
  const ex = rect.left + rect.width / 2;
  const ey = rect.top + rect.height / 2;
  const distanceToCenter = Math.hypot(cx - ex, cy - ey);
  const surfaceArea = rect.width * rect.height;

  // Tier A: confirmed intersecting via ratio store
  const ratioKey = `${observerId}::${targetIndex}`;
  const isIntersecting = (ratios[ratioKey] ?? 0) > 0;

  // Expanded viewport by rootMargin (Tier B check)
  const margin = parseRootMarginPx(observer.options?.rootMargin);
  const expandedTop = -margin.top;
  const expandedLeft = -margin.left;
  const expandedBottom = window.innerHeight + margin.bottom;
  const expandedRight = window.innerWidth + margin.right;

  const isInExpandedViewport =
    rect.bottom > expandedTop &&
    rect.right > expandedLeft &&
    rect.top < expandedBottom &&
    rect.left < expandedRight;

  // Actual viewport check (Tier C)
  const isInViewport =
    rect.bottom > 0 &&
    rect.right > 0 &&
    rect.top < window.innerHeight &&
    rect.left < window.innerWidth;

  // isInRootMargin: inside expanded zone but NOT in actual viewport
  const isInRootMargin =
    isInExpandedViewport && !isInViewport && !isIntersecting;

  let priority: SmartQueuePriority;
  if (isIntersecting) {
    priority = 'A';
  } else if (isInRootMargin) {
    priority = 'B';
  } else if (isInViewport) {
    priority = 'C';
  } else {
    priority = 'D';
  }

  return {
    priority,
    distanceToCenter,
    surfaceArea,
    isIntersecting,
    isInRootMargin,
  };
}

// ---------------------------------------------------------------------------
// sortEntries (private)
// ---------------------------------------------------------------------------

const PRIORITY_WEIGHT: Record<SmartQueuePriority, number> = {
  A: 0,
  B: 1,
  C: 2,
  D: 3,
};

function sortEntries(entries: SmartQueueEntry[]): SmartQueueEntry[] {
  return [...entries].sort((a, b) => {
    const pw = PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority];
    if (pw !== 0) return pw;
    const dc = a.distanceToCenter - b.distanceToCenter;
    if (dc !== 0) return dc;
    return a.surfaceArea - b.surfaceArea;
  });
}

// ---------------------------------------------------------------------------
// buildSmartQueue (public)
// ---------------------------------------------------------------------------

/**
 * Build the Smart Queue: classify all non-zombie observer targets, sort them,
 * and return the top N (MAX_VISIBLE_OVERLAYS = 30) entries.
 *
 * @param observers  - Current observer registry snapshot.
 * @param ratios     - Current intersection ratios from the store.
 */
export function buildSmartQueue(
  observers: Record<string, ObserverMetadata>,
  ratios: IntersectionRatioMap = {},
): SmartQueueEntry[] {
  const entries: SmartQueueEntry[] = [];

  for (const [observerId, observer] of Object.entries(observers)) {
    if (observer.isZombie) continue; // § g — Zombie Exclusion

    let targetIndex = 0;
    for (const target of observer.targets) {
      const classification = classifyTarget(
        target,
        observer,
        observerId,
        targetIndex,
        ratios,
      );
      entries.push({
        observerId,
        targetIndex,
        target,
        ...classification,
      });
      targetIndex++;
    }
  }

  return sortEntries(entries).slice(0, MAX_VISIBLE_OVERLAYS);
}
