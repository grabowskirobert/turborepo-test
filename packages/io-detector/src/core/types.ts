/**
 * Types for Intersection Observer Detector Core
 */

export interface ObserverMetadata {
  id: string;
  instance: IntersectionObserver;
  callback: IntersectionObserverCallback;
  targets: Set<Element>;
  isZombie: boolean;
  createdAt: number;
  options?: IntersectionObserverInit;
  stackTrace?: string;
}

export interface ObserverRegistry {
  observers: Map<string, ObserverMetadata>;
}

export interface UIConfig {
  collapsed: boolean;
  inspectionMode: 'none' | 'highlight' | 'inspect';
  selectedObserverId: string | null;
  // FEAT-002: tracks which group fingerprints are expanded in the panel
  expandedGroups: Set<string>;
}

// ---------------------------------------------------------------------------
// FEAT-002 types
// ---------------------------------------------------------------------------

/**
 * A stable string key derived from observer options (root + rootMargin + thresholds).
 * Observers sharing the same fingerprint are aggregated into one panel group.
 */
export type ObserverFingerprint = string;

/**
 * A group of observers that share the same fingerprint.
 * Rendered as a single collapsible row in the Live Monitor Panel.
 */
export interface ObserverGroup {
  fingerprint: ObserverFingerprint;
  /** Resolved via Weighted Fallback System (see core/naming.ts) */
  displayName: string;
  members: ObserverMetadata[];
  /** True when ALL members are zombies */
  isZombie: boolean;
}

/**
 * Per-target intersection ratio, keyed by `"${observerId}::${targetIndex}"`.
 * Updated on every IntersectionObserver callback tick.
 */
export type IntersectionRatioMap = Record<string, number>;

/**
 * Port for observer registry storage.
 * Dependency Inversion: Core logic depends on this abstraction,
 * concrete implementation (nanostores) is injected at composition root.
 */
export interface ObserverRegistryPort {
  set(id: string, metadata: ObserverMetadata): void;
  remove(id: string): void;
  getAll(): Record<string, ObserverMetadata>;
  markZombie(id: string): void;
  // FEAT-002: optional ratio update hook injected from stores
  updateRatio?: (
    observerId: string,
    targetIndex: number,
    ratio: number,
  ) => void;
}
