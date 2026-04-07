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
 */
export function useOverlayRenderer(
  registry: ObserverRegistryPort,
): OverlayRendererState {
  const safetyTier = useStore($safetyTier);
  const rects = useStore($overlayRects);
  const config = useStore($visualOverlayConfig);

  // Loop A — Priority Loop (throttled ~200ms)
  useEffect(() => {
    startLoopA(registry, updateVisibleOverlayIds, {
      getConfig: () => $visualOverlayConfig.get(),
      onSafetyTierUpdate: (tier) => $safetyTier.set(tier),
      // Hysteresis: first Tier 3 entry without user override → lock visuals OFF
      onEnterTier3: () => {
        const cfg = $visualOverlayConfig.get();
        if (cfg.userToggledOn === null) {
          $visualOverlayConfig.set({ ...cfg, userToggledOn: false });
        }
      },
    });
    return () => {
      stopLoopA();
    };
  }, [registry]);

  // Loop B — Render Loop (rAF)
  useEffect(() => {
    startLoopB(updateOverlayRects);
    return () => {
      stopLoopB();
    };
  }, []);

  // areVisualsActive: tier default OR user override
  const areVisualsActive =
    config.userToggledOn !== null
      ? config.userToggledOn
      : safetyTier.areVisualsEnabled;

  return {
    rects,
    safetyTier,
    areVisualsActive,
    forceShowId: config.forceShowId,
  };
}
