export type {
  ObserverMetadata,
  ObserverRegistry,
  UIConfig,
  ObserverRegistryPort,
  // FEAT-002
  ObserverGroup,
  ObserverFingerprint,
  IntersectionRatioMap,
  // FEAT-003
  SafetyTier,
  SafetyTierState,
  SmartQueuePriority,
  SmartQueueEntry,
  OverlayRect,
  VisualOverlayConfig,
} from './types';
export { MAX_VISIBLE_OVERLAYS, LOOP_A_INTERVAL_MS } from './types';
export {
  initMonkeyPatch,
  destroyMonkeyPatch,
  isPatchActive,
} from './monkey-patch';
export { startZombiePolling, stopZombiePolling } from './zombie-detector';
// FEAT-002
export { computeFingerprint, groupObservers } from './grouping';
export { resolveGroupName } from './naming';
export { computeSelector } from './selector';
// FEAT-003
export { determineSafetyTier } from './safety-tiers';
export { buildSmartQueue } from './smart-queue';
export {
  startLoopA,
  stopLoopA,
  startLoopB,
  stopLoopB,
  isElementInViewport,
} from './visual-overlay';
