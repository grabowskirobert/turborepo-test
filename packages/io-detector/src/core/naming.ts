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
 */
function getCallbackName(members: ObserverMetadata[]): string | null {
  for (const m of members) {
    const name = m.callback.name;
    if (name && name !== 'anonymous' && name !== '') {
      return name;
    }
  }
  return null;
}

/**
 * Level 2: data-io-name attribute on any target of any member.
 */
function getDataIoName(members: ObserverMetadata[]): string | null {
  for (const m of members) {
    for (const el of m.targets) {
      const name = (el as HTMLElement).dataset?.ioName;
      if (name) return name;
    }
  }
  return null;
}

/**
 * Level 3: homogeneous tag inference.
 */
function getHomogeneousTag(members: ObserverMetadata[]): string | null {
  const tags = new Set<string>();
  for (const m of members) {
    for (const el of m.targets) {
      tags.add(el.tagName.toLowerCase());
    }
  }
  if (tags.size !== 1) return null;
  const [tag] = tags;
  return `Observer (<${tag}>)`;
}

// ---------------------------------------------------------------------------
// resolveGroupName (public)
// ---------------------------------------------------------------------------

/**
 * Resolve a human-readable display name for an observer group.
 *
 * @param members  - Sorted list of ObserverMetadata belonging to the group
 * @param counter  - 1-based index used for the anonymous fallback label
 */
export function resolveGroupName(
  members: ObserverMetadata[],
  counter: number,
): string {
  return (
    getCallbackName(members) ??
    getDataIoName(members) ??
    getHomogeneousTag(members) ??
    `Anonymous Observer #${counter}`
  );
}
