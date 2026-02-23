/**
 * FEAT-003 — VisualOverlay
 *
 * Top-level overlay component rendered via React Portal (inside ShadowRoot).
 * Projects colored overlays representing rootMargin zones and intersection areas.
 * Manages Dual-Loop lifecycle via useOverlayRenderer hook.
 *
 * Layered at z-index: 10 (below Panel at z-index: 9999) within the Shadow Host.
 * Container: pointer-events: none (pass all clicks to underlying app).
 *
 * @see feat-003.md
 * @see feat-001.md § 7.e — Internal Layering
 */
import type { ReactNode } from 'react';
import type { ObserverRegistryPort } from '@/core';
import { useOverlayRenderer } from '@/hooks/useOverlayRenderer';
import { toggleVisualOverlay } from '@/stores';
import { OverlayItem, SafetyTierStatus } from './overlay';

interface VisualOverlayProps {
  /** Injected registry port — passed down from IODetector composition root. */
  registry: ObserverRegistryPort;
}

/**
 * TODO(feat-003): implement
 *   - Call useOverlayRenderer(registry) to get { rects, safetyTier, areVisualsActive, forceShowId }
 *   - Render outer container:
 *       className="io-overlay-canvas"
 *       style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 10 }}
 *   - Render <SafetyTierStatus> with tierState, areVisualsActive, onToggle={toggleVisualOverlay}
 *   - If !areVisualsActive AND no forceShowId → render only SafetyTierStatus (no overlay items)
 *   - Map rects → <OverlayItem>
 *       key={rect.id}
 *       isForceShow={rect.id === forceShowId}
 *   - Max rendered items: rects.length (already capped by Smart Queue at 30 + 1 force-show)
 */
export function VisualOverlay({ registry }: VisualOverlayProps): ReactNode {
  const { rects, safetyTier, areVisualsActive, forceShowId } =
    useOverlayRenderer(registry);

  // TODO(feat-003): implement — replace stub below
  void rects;
  void areVisualsActive;
  void forceShowId;
  void OverlayItem;

  return (
    <div
      className="io-overlay-canvas"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 10,
      }}
    >
      <SafetyTierStatus
        tierState={safetyTier}
        areVisualsActive={areVisualsActive}
        onToggle={toggleVisualOverlay}
      />
      {/* TODO(feat-003): render OverlayItem for each rect when areVisualsActive */}
      {/* TODO(feat-003): always render force-show overlay if forceShowId is set */}
    </div>
  );
}
