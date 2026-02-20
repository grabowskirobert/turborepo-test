/**
 * FEAT-002 — Observer Grouping
 *
 * Aggregates ObserverMetadata instances into ObserverGroup[] by their
 * "fingerprint" — a stable key derived from (root + rootMargin + thresholds).
 *
 * @see feat-002.md § B. Smart Naming & Aggregation
 */
import type {
  ObserverMetadata,
  ObserverGroup,
  ObserverFingerprint,
} from './types';

// ---------------------------------------------------------------------------
// computeFingerprint
// ---------------------------------------------------------------------------

/**
 * Produce a stable, deterministic fingerprint for a set of observer options.
 *
 * TODO(feat-002): implement stable serialisation
 *   - root:       "viewport" | "custom-root"
 *   - rootMargin: normalise whitespace
 *   - threshold:  sort + toFixed(2) join
 *
 * @example
 *   computeFingerprint({ rootMargin: '0px', threshold: [0, 0.5, 1] })
 *   // => "viewport|0px|0.00,0.50,1.00"
 */
export function computeFingerprint(
  options?: IntersectionObserverInit,
): ObserverFingerprint {
  // TODO(feat-002): implement
  void options;
  return 'PLACEHOLDER_FINGERPRINT';
}

// ---------------------------------------------------------------------------
// groupObservers
// ---------------------------------------------------------------------------

/**
 * Group a flat observer registry map into sorted ObserverGroup[].
 * Each group's displayName is resolved via the Weighted Fallback System
 * (see core/naming.ts → resolveGroupName).
 *
 * TODO(feat-002): implement
 *   1. Iterate observers, computeFingerprint per entry
 *   2. Bucket into Map<fingerprint, ObserverMetadata[]>
 *   3. For each bucket: resolveGroupName + build ObserverGroup
 *   4. Sort groups by earliest member.createdAt
 */
export function groupObservers(
  _observers: Record<string, ObserverMetadata>,
): ObserverGroup[] {
  // TODO(feat-002): implement
  return [];
}
