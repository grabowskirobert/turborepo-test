/**
 * FEAT-002 — Weighted Fallback System (Observer Group Naming)
 *
 * Priority order per feat-002.md § B:
 *   1. Explicit callback function name  (e.g. "handleImageFade")
 *   2. data-io-name attribute on first target  (e.g. "HeroLazyLoad")
 *   3. Homogeneous tag name  (e.g. "Observer (<img>)")
 *   4. Fallback  "Anonymous Observer #N"
 *
 * @see feat-002.md § B. Smart Naming & Aggregation
 */
import type { ObserverMetadata } from './types';

// ---------------------------------------------------------------------------
// Private helpers — one per fallback level
// ---------------------------------------------------------------------------

/**
 * Level 1: named callback function.
 * TODO(feat-002): check m.callback.name, skip "anonymous" / ""
 */
function getCallbackName(_members: ObserverMetadata[]): string | null {
  // TODO(feat-002): implement
  return null;
}

/**
 * Level 2: data-io-name attribute on any target of any member.
 * TODO(feat-002): iterate members → targets → (el as HTMLElement).dataset.ioName
 */
function getDataIoName(_members: ObserverMetadata[]): string | null {
  // TODO(feat-002): implement
  return null;
}

/**
 * Level 3: homogeneous tag inference.
 * Collect unique tagNames across ALL targets of ALL members.
 * If uniqueTags.size === 1 → return `Observer (<tag>)` (e.g. "Observer (<img>)")
 * If heterogeneous (multiple distinct tags) → return null (fall through to Level 4)
 *
 * TODO(feat-002): implement
 *   - iterate members → iterate member.targets → collect el.tagName.toLowerCase()
 *   - deduplicate into a Set
 *   - if set.size !== 1 → return null
 */
function getHomogeneousTag(_members: ObserverMetadata[]): string | null {
  // TODO(feat-002): implement
  return null;
}

// ---------------------------------------------------------------------------
// resolveGroupName (public)
// ---------------------------------------------------------------------------

/**
 * Resolve a human-readable display name for an observer group.
 *
 * @param members  - Sorted list of ObserverMetadata belonging to the group
 * @param counter  - 1-based index used for the anonymous fallback label
 *
 * TODO(feat-002): wire up helpers above in priority order
 */
export function resolveGroupName(
  members: ObserverMetadata[],
  counter: number,
): string {
  // TODO(feat-002): each helper returns null until implemented — fallback fires
  return (
    getCallbackName(members) ??
    getDataIoName(members) ??
    getHomogeneousTag(members) ??
    `Anonymous Observer #${counter}`
  );
}
