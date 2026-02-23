/**
 * FEAT-003 — OverlayItem
 *
 * Composite overlay for a single observer target.
 * Combines RootMarginZone + IntersectionHighlight + target outline.
 *
 * @see feat-003.md § a, c
 */
import type { ReactNode } from 'react';
import type { OverlayRect } from '@/core';
// todo: mozna czy nie?
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
  // TODO(feat-003): implement
  void overlay;
  void isForceShow;
  void RootMarginZone;
  void IntersectionHighlight;
  return null;
}
