/**
 * Domain barrel — the shared vocabulary of the detector.
 *
 * Every layer may import from here; this layer imports from nobody.
 */
export type {
  ObserverMetadata,
  ObserverRegistry,
  UIConfig,
  ObserverRegistryPort,
  ObserverGroup,
  ObserverFingerprint,
  IntersectionRatioMap,
  SafetyTier,
  SafetyTierState,
  SmartQueuePriority,
  SmartQueueEntry,
  OverlayRect,
  VisualOverlayConfig,
} from './types';
export { MAX_VISIBLE_OVERLAYS, LOOP_A_INTERVAL_MS } from './types';
