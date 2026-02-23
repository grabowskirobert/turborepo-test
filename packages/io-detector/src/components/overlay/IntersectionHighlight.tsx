/**
 * FEAT-003 — IntersectionHighlight
 *
 * Renders the intersection area (visible portion of the target element).
 * Color: Neon Green (rgba(0, 255, 0, 0.3)) with additive blending.
 *
 * @see feat-003.md § a. Visual Visualization
 */
import type { ReactNode } from 'react';

interface IntersectionHighlightProps {
  /** Intersection bounding rect (visible portion of the target). */
  rect: DOMRect;
  /** Whether this highlight should be visible (Cheap Cull passed). */
  isVisible: boolean;
}

/**
 * TODO(feat-003): implement
 *   - Render a positioned <div> with:
 *       position: fixed
 *       top/left/width/height from rect
 *       background: var(--io-target-color)  → rgba(0, 255, 0, 0.3)
 *       mix-blend-mode: screen  (additive blending)
 *       pointer-events: none
 *       opacity: isVisible ? 1 : 0  (Cheap Cull)
 *   - Use className "io-overlay-intersection"
 */
export function IntersectionHighlight({
  rect,
  isVisible,
}: IntersectionHighlightProps): ReactNode {
  // TODO(feat-003): implement
  void rect;
  void isVisible;
  return null;
}
