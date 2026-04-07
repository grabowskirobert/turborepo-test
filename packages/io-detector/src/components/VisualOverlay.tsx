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
 * ## Render Order (Three-Pass)
 *
 * Overlays are rendered in three global passes to ensure correct visual layering
 * across all active observers — regardless of their position in the Smart Queue:
 *
 *   Pass 1 — rootMargin zones  (Magenta)  — bottom layer
 *   Pass 2 — intersection rects (Green)   — middle layer  ← always above all magentas
 *   Pass 3 — target outlines   (Yellow)   — top layer
 *
 * Without this separation, a magenta zone from Observer A could appear above the
 * green intersection of Observer B (because each OverlayItem rendered all its own
 * layers atomically, interleaving magenta/green across items).
 *
 * @see feat-003.md
 * @see feat-001.md § 7.e — Internal Layering
 */
import type { ReactNode } from 'react';
import type { ObserverRegistryPort, OverlayRect } from '@/core';
import { useOverlayRenderer } from '@/hooks/useOverlayRenderer';
import { toggleVisualOverlay } from '@/stores';
import {
  RootMarginZone,
  IntersectionHighlight,
  SafetyTierStatus,
} from './overlay';

interface VisualOverlayProps {
  /** Injected registry port — passed down from IODetector composition root. */
  registry: ObserverRegistryPort;
}

export function VisualOverlay({ registry }: VisualOverlayProps): ReactNode {
  const { rects, safetyTier, areVisualsActive, forceShowId } =
    useOverlayRenderer(registry);

  // Normal overlays (active visuals only) + force-show item merged into one list.
  // Both sets go through the same three-pass rendering below.
  const normalRects: OverlayRect[] = areVisualsActive
    ? rects.filter((r) => r.id !== forceShowId)
    : [];
  const forcedRect = forceShowId
    ? (rects.find((r) => r.id === forceShowId) ?? null)
    : null;
  const allRects: OverlayRect[] = forcedRect
    ? [...normalRects, forcedRect]
    : normalRects;

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
      {/* Safety tier status bar — always visible, pointer-events: auto via CSS */}
      <SafetyTierStatus
        tierState={safetyTier}
        areVisualsActive={areVisualsActive}
        onToggle={toggleVisualOverlay}
      />

      {/*
       * ── Pass 1: rootMargin zones — Magenta (bottom layer) ────────────────
       *
       * isolation: isolate creates a separate blending context so that magentas
       * screen-blend with each other (density signal) but the composited group
       * is placed onto the page via normal alpha — NOT screen. This prevents
       * Pass 2 greens from cross-blending with magentas (which would produce
       * cyan/white instead of visible green).
       */}
      <div style={{ isolation: 'isolate' }}>
        {allRects.map((rect) => {
          if (!rect.rootMarginRect) return null;
          const isVisible = rect.id === forceShowId || rect.isInViewport;
          return (
            <RootMarginZone
              key={`rm-${rect.id}`}
              rect={rect.rootMarginRect}
              isVisible={isVisible}
            />
          );
        })}
      </div>

      {/*
       * ── Pass 2: intersection highlights — Neon Green (middle layer) ───────
       *
       * Own isolated context: greens screen-blend with each other (multiple
       * intersections accumulate), but the group composites normally on top of
       * the magenta layer — green stays green regardless of what's below.
       */}
      <div style={{ isolation: 'isolate' }}>
        {allRects.map((rect) => {
          if (!rect.intersectionRect) return null;
          const isVisible = rect.id === forceShowId || rect.isInViewport;
          return (
            <IntersectionHighlight
              key={`int-${rect.id}`}
              rect={rect.intersectionRect}
              isVisible={isVisible}
            />
          );
        })}
      </div>

      {/* ── Pass 3: target outlines — Yellow dashed (top layer) ───────────── */}
      <div style={{ isolation: 'isolate' }}>
        {allRects.map((rect) => {
          const isVisible = rect.id === forceShowId || rect.isInViewport;
          return (
            <div
              key={`target-${rect.id}`}
              className="io-overlay-target"
              style={{
                top: rect.targetRect.top,
                left: rect.targetRect.left,
                width: rect.targetRect.width,
                height: rect.targetRect.height,
                opacity: isVisible ? 1 : 0,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
