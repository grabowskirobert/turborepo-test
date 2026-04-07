/**
 * FEAT-003 — OverlayItem
 *
 * @deprecated No longer used in the main render path.
 *
 * Originally composed RootMarginZone + IntersectionHighlight + target outline
 * for a single observer target in one atomic block. Superseded by the
 * three-pass rendering in VisualOverlay.tsx, which renders all layers globally
 * across all rects to guarantee correct DOM stacking:
 *
 *   Pass 1 — all RootMarginZones     (Magenta) — bottom
 *   Pass 2 — all IntersectionHighlights (Green) — middle
 *   Pass 3 — all target outlines      (Yellow) — top
 *
 * The atomic approach caused magenta from Observer A to appear above the green
 * intersection of Observer B when rendered in Smart Queue order.
 *
 * Kept for reference. Safe to remove if no external consumers exist.
 *
 * @see VisualOverlay.tsx
 * @see feat-003.md § a, c
 */
import type { ReactNode } from 'react';
import type { OverlayRect } from '@/core';
import { RootMarginZone } from './RootMarginZone';
import { IntersectionHighlight } from './IntersectionHighlight';

interface OverlayItemProps {
  overlay: OverlayRect;
  /** True if this is the force-shown (Spot Check) overlay. */
  isForceShow: boolean;
}

/**
 * TODO(feat-003): implement
 *   - Render:
 *       1. <RootMarginZone> if overlay.rootMarginRect is not null
 *       2. <IntersectionHighlight> if overlay.intersectionRect is not null
 *       3. Target element outline (yellow dashed 2px via CSS class io-overlay-target)
 *   - Pass `visible: overlay.isInViewport` to children (Cheap Cull → opacity 0 if off-screen)
 *   - Force-show items always get visible=true (bypass Cheap Cull)
 *   - All wrappers must have pointer-events: none
 */
export function OverlayItem({
  overlay,
  isForceShow,
}: OverlayItemProps): ReactNode {
  // Force-show items always bypass Cheap Cull
  const isVisible = isForceShow || overlay.isInViewport;
  const { targetRect } = overlay;

  return (
    <>
      {/* 1. rootMargin buffer zone — Magenta */}
      {overlay.rootMarginRect && (
        <RootMarginZone rect={overlay.rootMarginRect} isVisible={isVisible} />
      )}

      {/* 2. Intersection highlight — Neon Green */}
      {overlay.intersectionRect && (
        <IntersectionHighlight
          rect={overlay.intersectionRect}
          isVisible={isVisible}
        />
      )}

      {/* 3. Target element outline — Yellow dashed */}
      <div
        className="io-overlay-target"
        style={{
          top: targetRect.top,
          left: targetRect.left,
          width: targetRect.width,
          height: targetRect.height,
          opacity: isVisible ? 1 : 0,
        }}
      />
    </>
  );
}
