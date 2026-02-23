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
  SmartQueueEntry,
  SmartQueuePriority,
} from './types';
import { MAX_VISIBLE_OVERLAYS } from './types';

// ---------------------------------------------------------------------------
// classifyTarget (private)
// ---------------------------------------------------------------------------

/**
 * Classify a single observer target into its Smart Queue priority tier.
 *
 * TODO(feat-003): implement
 *   - Use entry.isIntersecting (from last IntersectionObserverEntry if available)
 *     or fall back to getBoundingClientRect heuristics:
 *       1. Tier A: target is intersecting its root.
 *       2. Tier B: target is within the rootMargin zone but NOT intersecting.
 *       3. Tier C: target is in the viewport (visible) but outside rootMargin.
 *       4. Tier D: target is off-screen.
 *   - Compute distanceToCenter:
 *       const cx = window.innerWidth / 2;
 *       const cy = window.innerHeight / 2;
 *       const rect = target.getBoundingClientRect();
 *       const ex = rect.left + rect.width / 2;
 *       const ey = rect.top + rect.height / 2;
 *       return Math.hypot(cx - ex, cy - ey);
 *   - Compute surfaceArea: rect.width * rect.height
 */
function classifyTarget(
  _target: Element,
  _observer: ObserverMetadata,
): {
  priority: SmartQueuePriority;
  distanceToCenter: number;
  surfaceArea: number;
  isIntersecting: boolean;
  isInRootMargin: boolean;
} {
  // TODO(feat-003): implement
  return {
    priority: 'D',
    distanceToCenter: Infinity,
    surfaceArea: 0,
    isIntersecting: false,
    isInRootMargin: false,
  };
}

// ---------------------------------------------------------------------------
// sortEntries (private)
// ---------------------------------------------------------------------------

/**
 * Sort SmartQueueEntry[] by priority tier (A→D), then by distanceToCenter (asc),
 * with surfaceArea as tie-breaker (smaller wins).
 *
 * TODO(feat-003): implement
 *   - Priority weight map: { A: 0, B: 1, C: 2, D: 3 }
 *   - Primary sort: priority weight ascending
 *   - Secondary sort: distanceToCenter ascending
 *   - Tertiary sort: surfaceArea ascending
 */
function sortEntries(entries: SmartQueueEntry[]): SmartQueueEntry[] {
  // TODO(feat-003): implement — return sorted copy
  return [...entries];
}

// ---------------------------------------------------------------------------
// buildSmartQueue (public)
// ---------------------------------------------------------------------------

/**
 * Build the Smart Queue: classify all non-zombie observer targets, sort them,
 * and return the top N (MAX_VISIBLE_OVERLAYS = 30) entries.
 *
 * @param _observers  - Current observer registry snapshot (non-zombie only).
 * @returns          - Sorted & capped list of SmartQueueEntry[].
 *
 * TODO(feat-003): implement
 *   1. Iterate observers → skip zombies (o.isZombie === true) per feat-003.md § g
 *   2. For each observer, iterate targets → classifyTarget()
 *   3. Build SmartQueueEntry[] with observerId, targetIndex, etc.
 *   4. sortEntries()
 *   5. Slice to MAX_VISIBLE_OVERLAYS
 */
export function buildSmartQueue(
  _observers: Record<string, ObserverMetadata>,
): SmartQueueEntry[] {
  // TODO(feat-003): implement
  void classifyTarget;
  void sortEntries;
  void MAX_VISIBLE_OVERLAYS;
  return [];
}
