/**
 * FEAT-003 — RootMarginZone
 *
 * Renders the rootMargin buffer zone around an observer's root.
 * Color: Magenta (rgba(255, 0, 255, 0.033)) with Yellow dashed border (2px).
 * Alpha is intentionally low so that 30 overlapping layers reach max saturation.
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

export function RootMarginZone({
  rect,
  isVisible,
}: RootMarginZoneProps): ReactNode {
  return (
    <div
      className="io-overlay-rootmargin"
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
