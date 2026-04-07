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
  // FEAT-003: read all current ratios for Smart Queue classification
  getRatios?: () => IntersectionRatioMap;
}

// ---------------------------------------------------------------------------
// FEAT-003 types — Visual Debug Overlay
// ---------------------------------------------------------------------------

/**
 * The Three-Tier Safety System tiers.
 * @see feat-003.md § d
 */
export type SafetyTier = 1 | 2 | 3;

/**
 * Current safety tier state with metadata.
 */
export interface SafetyTierState {
  tier: SafetyTier;
  totalObservers: number;
  /** Human-readable status message per feat-003.md § d */
  statusMessage: string;
  /** Whether visuals are enabled (ON/OFF) for the current tier */
  areVisualsEnabled: boolean;
}

/**
 * Priority tier for Smart Queue sorting.
 * @see feat-003.md § e — Sorting Criteria (Weighted)
 */
export type SmartQueuePriority = 'A' | 'B' | 'C' | 'D';

/**
 * A scored entry in the Smart Queue, representing a single observer target
 * eligible for visual overlay rendering.
 */
export interface SmartQueueEntry {
  observerId: string;
  targetIndex: number;
  target: Element;
  priority: SmartQueuePriority;
  /** Distance from screen center (px). Lower = closer to center. */
  distanceToCenter: number;
  /** Surface area (width × height) — tie-breaker: smaller wins. */
  surfaceArea: number;
  /** Whether the target is currently intersecting its root. */
  isIntersecting: boolean;
  /** Whether the target is inside rootMargin but not intersecting. */
  isInRootMargin: boolean;
}

/**
 * Computed geometry for a single overlay rect.
 * Positions are absolute to the viewport (for CSS `position: fixed`).
 */
export interface OverlayRect {
  /** Unique key: "${observerId}::${targetIndex}" */
  id: string;
  /** Target element bounding rect */
  targetRect: DOMRect;
  /** rootMargin zone bounding rect (expanded by rootMargin) */
  rootMarginRect: DOMRect | null;
  /** Intersection rect (visible portion) */
  intersectionRect: DOMRect | null;
  /** Whether the element passed the Cheap Cull viewport check */
  isInViewport: boolean;
}

/**
 * Visual Overlay global configuration.
 */
export interface VisualOverlayConfig {
  /** User manual toggle state — survives tier transitions (Hysteresis) */
  userToggledOn: boolean | null;
  /** ID being force-shown via hover (Spot Check). null = none. */
  forceShowId: string | null;
}

/** Hard cap on simultaneously rendered overlays (30 + 1 force-show). */
export const MAX_VISIBLE_OVERLAYS = 30;

/** Loop A throttle interval in ms. */
export const LOOP_A_INTERVAL_MS = 200;
