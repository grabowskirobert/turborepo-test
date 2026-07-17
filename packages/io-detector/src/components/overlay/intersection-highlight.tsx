/**
 * FEAT-003 — IntersectionHighlight
 *
 * Renders the intersection area (visible portion of the target element).
 * Color: Neon Green (rgba(0, 255, 0, 0.25)) with normal blending (covers magenta below).
 * Alpha is intentionally low so that 30 overlapping layers reach max saturation.
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

export function IntersectionHighlight({
  rect,
  isVisible,
}: IntersectionHighlightProps): ReactNode {
  return (
    <div
      className="io-overlay-intersection"
      style={{
        position: 'fixed',
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        mixBlendMode: 'screen',
        pointerEvents: 'none',
        opacity: isVisible ? 1 : 0,
      }}
    />
  );
}
