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
import { resolveGroupName } from './naming';

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
  const root = options?.root ? 'custom-root' : 'viewport';
  const rootMargin = (options?.rootMargin ?? '0px 0px 0px 0px')
    .trim()
    .replace(/\s+/g, ' ');
  const rawThresholds = options?.threshold ?? [0];
  const thresholds = (
    Array.isArray(rawThresholds) ? rawThresholds : [rawThresholds]
  )
    .slice()
    .sort((a, b) => a - b)
    .map((t) => t.toFixed(2))
    .join(',');
  return `${root}|${rootMargin}|${thresholds}`;
}

// ---------------------------------------------------------------------------
// groupObservers
// ---------------------------------------------------------------------------

/**
 * Group a flat observer registry map into sorted ObserverGroup[].
 * Each group's displayName is resolved via the Weighted Fallback System
 * (see core/naming.ts → resolveGroupName).
 */
export function groupObservers(
  observers: Record<string, ObserverMetadata>,
): ObserverGroup[] {
  // 1. Bucket by fingerprint
  const buckets = new Map<ObserverFingerprint, ObserverMetadata[]>();
  for (const metadata of Object.values(observers)) {
    const fp = computeFingerprint(metadata.options);
    const bucket = buckets.get(fp);
    if (bucket) {
      bucket.push(metadata);
    } else {
      buckets.set(fp, [metadata]);
    }
  }

  // 2. Build ObserverGroup[] sorted by earliest createdAt in each bucket
  const groups: ObserverGroup[] = [];
  let counter = 1;
  for (const [fingerprint, members] of buckets) {
    members.sort((a, b) => a.createdAt - b.createdAt);
    groups.push({
      fingerprint,
      displayName: resolveGroupName(members, counter++),
      members,
      isZombie: members.every((m) => m.isZombie),
    });
  }

  // 3. Sort groups by earliest member.createdAt
  groups.sort(
    (a, b) => (a.members[0]?.createdAt ?? 0) - (b.members[0]?.createdAt ?? 0),
  );

  return groups;
}
