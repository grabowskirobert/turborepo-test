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

export function SafetyTierStatus({
  tierState,
  areVisualsActive,
  onToggle,
}: SafetyTierStatusProps): ReactNode {
  const isDanger = tierState.tier === 3 && !areVisualsActive;

  return (
    <div className="io-safety-status">
      <span className="io-safety-status__message">
        {tierState.statusMessage}
      </span>
      <button
        className={`io-safety-status__toggle${isDanger ? ' io-safety-status__toggle--danger' : ''}`}
        onClick={onToggle}
        title={
          isDanger
            ? 'Visuals disabled due to high load. Hard limit: 30 overlays.'
            : undefined
        }
      >
        {areVisualsActive ? 'Disable Visuals' : 'Enable Visuals'}
      </button>
    </div>
  );
}
