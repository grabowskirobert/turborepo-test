/**
 * FEAT-002 — Visual Overlay Hooks
 *
 * @see feat-002.md § D. Interaction: Reverse Lookup & Inspection
 */
import { useCallback, useEffect, useRef } from 'react';
import type React from 'react';
import {
  clearTargetHighlight,
  flashTarget,
  highlightTarget,
  inspectTarget,
} from '@/integration/dom-target-effects';

// ---------------------------------------------------------------------------
// useHighlight
// ---------------------------------------------------------------------------

/**
 * Highlights the corresponding DOM target while hovering a living observer row.
 * Guards against zombie targets (target.isConnected === false).
 */
export function useHighlight(
  target: Element | null,
  isZombie: boolean,
): { onMouseEnter: () => void; onMouseLeave: () => void } {
  const onMouseEnter = useCallback(() => {
    if (!isZombie) highlightTarget(target);
  }, [target, isZombie]);

  const onMouseLeave = useCallback(() => {
    clearTargetHighlight(target);
  }, [target]);

  // Cleanup outline on unmount to avoid ghost styles on the host page
  useEffect(() => {
    return () => {
      clearTargetHighlight(target);
    };
  }, [target]);

  return { onMouseEnter, onMouseLeave };
}

// ---------------------------------------------------------------------------
// useInspect
// ---------------------------------------------------------------------------

/**
 * Returns an inspect handler for a DOM target element.
 *
 * Behaviour per feat-002.md § D:
 *   - Click:        scrollIntoView({ behavior: 'smooth', block: 'center' })
 *                   + temporary Flash effect (bright blue border, 800 ms)
 *   - Shift+Click:  console.log("[IO-Detector] Target Element:", element)
 */
export function useInspect(
  target: Element | null,
): (event: React.MouseEvent) => void {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    (event: React.MouseEvent) => {
      if (!target || !target.isConnected) return;

      if (event.shiftKey) {
        inspectTarget(target);
        return;
      }

      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = flashTarget(target);
    },
    [target],
  );
}
