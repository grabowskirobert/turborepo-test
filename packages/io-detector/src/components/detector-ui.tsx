/**
 * FEAT-002 — Live Monitor Panel
 *
 * Main panel component. Replaces the FEAT-001 placeholder.
 * Fixed bottom-right, collapsible, aggregates observers by fingerprint.
 *
 * @see feat-002.md
 */
import { useStore } from '@nanostores/react';
import type { ReactNode } from 'react';
import { $observers, $uiConfig } from '@/stores';
import { groupObservers } from '@/core';
import { EmptyState, ObserverGroupRow } from './panel';

export function DetectorUI(): ReactNode {
  const observers = useStore($observers);
  const uiConfig = useStore($uiConfig);

  const groups = groupObservers(observers);
  const totalObservers = Object.keys(observers).length;
  const zombieCount = Object.values(observers).filter((o) => o.isZombie).length;

  // ── Collapsed pill ────────────────────────────────────────────────────────
  if (uiConfig.collapsed) {
    return (
      <div className="io-detector-panel io-detector-panel--collapsed">
        <button
          className="io-detector-toggle"
          onClick={() => $uiConfig.set({ ...uiConfig, collapsed: false })}
          aria-label="Expand IO Detector"
        >
          👁 IO ({totalObservers})
          {zombieCount > 0 && (
            <span className="io-detector-badge">⚠️ {zombieCount}</span>
          )}
        </button>
      </div>
    );
  }

  // ── Expanded panel ────────────────────────────────────────────────────────
  return (
    <div className="io-detector-panel">
      {/* Header */}
      <header className="io-detector-header">
        <h2 className="io-detector-title">IO Detector</h2>
        <button
          className="io-detector-toggle"
          onClick={() => $uiConfig.set({ ...uiConfig, collapsed: true })}
          aria-label="Collapse IO Detector"
        >
          −
        </button>
      </header>

      {/* Stats bar */}
      <div className="io-detector-stats">
        <span>Active: {totalObservers}</span>
        {zombieCount > 0 && (
          <span className="io-detector-warning">💀 Zombies: {zombieCount}</span>
        )}
      </div>

      {/* Body */}
      <div className="io-detector-list">
        {groups.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="io-group-list">
            {groups.map((group) => (
              <li key={group.fingerprint}>
                <ObserverGroupRow group={group} />
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Footer */}
      <footer className="io-detector-footer">
        <small>Development Mode Only</small>
      </footer>
    </div>
  );
}
