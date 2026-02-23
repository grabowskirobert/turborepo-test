/**
 * FEAT-003 — Safety Tier Status Bar
 *
 * Displays the current safety tier status message and manual toggle button.
 *
 * @see feat-003.md § d, f
 */
import type { ReactNode } from 'react';
import type { SafetyTierState } from '@/core';

interface SafetyTierStatusProps {
  tierState: SafetyTierState;
  areVisualsActive: boolean;
  onToggle: VoidFunction;
}

/**
 * TODO(feat-003): implement
 *   - Display tierState.statusMessage
 *   - Show toggle button:
 *       label: areVisualsActive ? "Disable Visuals" : "Enable Visuals"
 *       onClick → onToggle (wires to toggleVisualOverlay in stores)
 *   - In Tier 3 with visuals OFF, show warning text per feat-003.md § d
 *   - Use className "io-safety-status"
 */
export function SafetyTierStatus({
  tierState,
  areVisualsActive,
  onToggle,
}: SafetyTierStatusProps): ReactNode {
  // TODO(feat-003): implement
  void tierState;
  void areVisualsActive;
  void onToggle;
  return null;
}
