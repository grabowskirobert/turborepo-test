export type {
  ObserverMetadata,
  ObserverRegistry,
  UIConfig,
  ObserverRegistryPort,
  // FEAT-002
  ObserverGroup,
  ObserverFingerprint,
  IntersectionRatioMap,
} from './types';
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
