/**
 * FEAT-003 — RootMarginZone
 *
 * Renders the rootMargin buffer zone around an observer's root.
 * Color: Magenta (rgba(255, 0, 255, 0.3)) with Yellow dashed border (2px).
 * Uses additive blending (mix-blend-mode: screen) for overlapping zones.
 *
 * @see feat-003.md § a. Visual Visualization
 */
import type { ReactNode } from 'react';

interface RootMarginZoneProps {
  /** Computed bounding rect for the rootMargin zone. */
  rect: DOMRect;
  /** Whether this zone should be visible (Cheap Cull passed). */
  isVisible: boolean;
}

/**
 * TODO(feat-003): implement
 *   - Render a positioned <div> with:
 *       position: fixed
 *       top/left/width/height from rect
 *       background: var(--io-rootmargin-color)  → rgba(255, 0, 255, 0.3)
 *       border: 2px dashed var(--io-guideline-color)  → yellow
 *       mix-blend-mode: screen  (additive blending)
 *       pointer-events: none
 *       opacity: isVisible ? 1 : 0  (Cheap Cull: instant hide)
 *   - Use className "io-overlay-rootmargin"
 */
export function RootMarginZone({
  rect,
  isVisible,
}: RootMarginZoneProps): ReactNode {
  // TODO(feat-003): implement
  void rect;
  void isVisible;
  return null;
}
