/**
 * FEAT-003 — useOverlayRenderer
 *
 * React hook that manages the Dual-Loop lifecycle (Loop A + Loop B).
 * Starts both loops on mount, stops on unmount.
 * Exposes the current overlay rects and safety tier for the VisualOverlay component.
 *
 * @see feat-003.md § c. Performance Architecture (Dual-Loop)
 */
import { useEffect } from 'react';
import { useStore } from '@nanostores/react';
import type { OverlayRect, SafetyTierState } from '@/core';
import { startLoopA, stopLoopA, startLoopB, stopLoopB } from '@/core';
import type { ObserverRegistryPort } from '@/core';
import {
  $safetyTier,
  $overlayRects,
  $visualOverlayConfig,
  updateVisibleOverlayIds,
  updateOverlayRects,
} from '@/stores';

interface OverlayRendererState {
  /** Current overlay rects computed by Loop B each frame. */
  rects: OverlayRect[];
  /** Current safety tier state from Loop A. */
  safetyTier: SafetyTierState;
  /** Whether visuals are currently enabled (considering tier + user override). */
  areVisualsActive: boolean;
  /** ID being force-shown (Spot Check hover). */
  forceShowId: string | null;
}

/**
 * Manages Dual-Loop lifecycle and returns reactive overlay state.
 *
 * @param registry - Injected registry port (must be stable across renders).
 *
 * TODO(feat-003): implement
 *   - useEffect to start/stop Loop A:
 *       startLoopA(registry, updateVisibleOverlayIds)
 *       return () => stopLoopA()
 *   - useEffect to start/stop Loop B:
 *       startLoopB(updateOverlayRects)
 *       return () => stopLoopB()
 *   - Subscribe to $safetyTier, $overlayRects, $visualOverlayConfig via useStore
 *   - Derive areVisualsActive: safetyTier.visualsEnabled OR userToggle override
 *   - Return OverlayRendererState
 */
export function useOverlayRenderer(
  registry: ObserverRegistryPort,
): OverlayRendererState {
  const safetyTier = useStore($safetyTier);
  const rects = useStore($overlayRects);
  const config = useStore($visualOverlayConfig);

  // TODO(feat-003): implement Loop A lifecycle
  useEffect(() => {
    // TODO(feat-003): startLoopA(_registry, updateVisibleOverlayIds);
    void registry;
    void updateVisibleOverlayIds;
    void startLoopA;
    return () => {
      stopLoopA();
    };
  }, [registry]);

  // TODO(feat-003): implement Loop B lifecycle
  useEffect(() => {
    // TODO(feat-003): startLoopB(updateOverlayRects);
    void updateOverlayRects;
    void startLoopB;
    return () => {
      stopLoopB();
    };
  }, []);

  // TODO(feat-003): derive visualsActive from tier + user override
  const areVisualsActive = safetyTier.areVisualsEnabled;

  return {
    rects,
    safetyTier,
    areVisualsActive,
    forceShowId: config.forceShowId,
  };
}
