/**
 * Integration barrel — DOM side-effects (shadow host mounting, overlay
 * geometry, target highlighting).
 *
 * Depends on `domain` only. Deliberately *not* re-exported from `core`:
 * core is pure logic and must not become a route to DOM effects.
 */
export type { ShadowHostHandle } from './shadow-host';
export { createShadowHost } from './shadow-host';

export type { LoopAOptions } from './visual-overlay';
export {
  isElementInViewport,
  startLoopA,
  stopLoopA,
  startLoopB,
  stopLoopB,
  setVisibleIds,
} from './visual-overlay';

export {
  highlightTarget,
  clearTargetHighlight,
  inspectTarget,
  flashTarget,
} from './dom-target-effects';
