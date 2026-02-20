/**
 * FEAT-002 — Visual Overlay Hooks
 *
 * @see feat-002.md § D. Interaction: Reverse Lookup & Inspection
 */

// ---------------------------------------------------------------------------
// useHighlight
// ---------------------------------------------------------------------------

/**
 * Highlights the corresponding DOM target while hovering a living observer row.
 * Guards against zombie targets (target.isConnected === false).
 *
 * Usage:
 *   const { onMouseEnter, onMouseLeave } = useHighlight(target, isZombie);
 *
 * TODO(feat-002): implement
 *   - onMouseEnter: if !isZombie && target.isConnected → apply highlight style
 *   - onMouseLeave: remove highlight style
 *   - highlight style: e.g. outline: "2px solid #7c3aed"
 *   - use useCallback for stable refs
 *   - cleanup on unmount (useEffect return)
 */
export function useHighlight(
  _target: Element | null,
  _isZombie: boolean,
): { onMouseEnter: () => void; onMouseLeave: () => void } {
  // TODO(feat-002): implement
  return {
    onMouseEnter: () => {},
    onMouseLeave: () => {},
  };
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
 *
 * TODO(feat-002): implement
 *   - return useCallback that checks event.shiftKey
 *   - flash: set attribute data-io-flash on target → matches [data-io-flash] rule in detector.css
 *   - cleanup: setTimeout(() => target.removeAttribute('data-io-flash'), 800)
 *   - guard: if target is null or !target.isConnected → no-op
 *   - consider cleanup on unmount (useEffect return) to clear pending timeout
 */
export function useInspect(
  _target: Element | null,
): (event: React.MouseEvent) => void {
  // TODO(feat-002): implement
  return () => {};
}
