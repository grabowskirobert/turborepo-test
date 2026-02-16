/**
 * Placeholder UI Component
 * Minimal UI for Foundation phase - expanded in FEAT-002
 */
import { useStore } from '@nanostores/react';
import { $observers, $uiConfig } from '../stores';
import type { ObserverMetadata } from '../core';
import type { ReactNode } from 'react';

export function DetectorUI(): ReactNode {
  const observers = useStore($observers);
  const uiConfig = useStore($uiConfig);

  const observerList = Object.values(observers) as ObserverMetadata[];
  const observerCount = observerList.length;
  const zombieCount = observerList.filter((o) => o.isZombie).length;

  if (uiConfig.collapsed) {
    return (
      <div className="io-detector-panel io-detector-panel--collapsed">
        <button
          className="io-detector-toggle"
          onClick={() => $uiConfig.set({ ...uiConfig, collapsed: false })}
          aria-label="Expand IO Detector"
        >
          👁 IO ({observerCount})
          {zombieCount > 0 && (
            <span className="io-detector-badge">⚠️ {zombieCount}</span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="io-detector-panel">
      <header className="io-detector-header">
        <h2 className="io-detector-title">Intersection Observer Detector</h2>
        <button
          className="io-detector-toggle"
          onClick={() => $uiConfig.set({ ...uiConfig, collapsed: true })}
          aria-label="Collapse IO Detector"
        >
          −
        </button>
      </header>

      <div className="io-detector-stats">
        <span>Active Observers: {observerCount}</span>
        {zombieCount > 0 && (
          <span className="io-detector-warning">⚠️ Zombies: {zombieCount}</span>
        )}
      </div>

      <div className="io-detector-list">
        {observerList.length === 0 ? (
          <p className="io-detector-empty">No observers detected yet.</p>
        ) : (
          <ul>
            {observerList.map((observer) => (
              <li
                key={observer.id}
                className={`io-detector-item ${observer.isZombie ? 'io-detector-item--zombie' : ''}`}
              >
                <span className="io-detector-item-id">{observer.id}</span>
                <span className="io-detector-item-targets">
                  Targets: {observer.targets.size}
                </span>
                {observer.isZombie && (
                  <span className="io-detector-item-zombie">🧟 ZOMBIE</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <footer className="io-detector-footer">
        <small>Development Mode Only</small>
      </footer>
    </div>
  );
}
