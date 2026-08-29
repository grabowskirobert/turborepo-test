/**
 * Public API of `@repo/io-detector`.
 *
 * Side-effect free — importing this module does not patch
 * `IntersectionObserver` or mount anything. For the self-mounting bundle
 * used by the DevTools extension, see `@repo/io-detector/bundle` (built from `./auto-init`).
 */
export {
  IODetector,
  IODetectorView,
  createIODetectorInstance,
} from './io-detector';
export type { IODetectorInstance } from './io-detector';

export type {
  ObserverMetadata,
  ObserverRegistry,
  ObserverRegistryPort,
  ObserverGroup,
  ObserverFingerprint,
  IntersectionRatioMap,
  UIConfig,
  SafetyTier,
  SafetyTierState,
  SmartQueuePriority,
  SmartQueueEntry,
  OverlayRect,
  VisualOverlayConfig,
} from './domain';
