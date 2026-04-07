/**
 * FEAT-002 — InstanceRow
 *
 * Renders a single row per observed target (Element) within an observer group.
 * Handles both living and zombie variants.
 *
 * @see feat-002.md § C. Detailed Instance List ("Fingerprint" Row)
 * @see feat-002.md § E. Zombie Hunter Integration & "Force Stop"
 */
import type { ReactNode } from 'react';
import type { ObserverMetadata } from '@/core';
import { computeSelector } from '@/core';
import { Thumbnail } from './Thumbnail';
import { useHighlight, useInspect } from '@/hooks/useVisualOverlay';
import { setForceShowId } from '@/stores';

interface InstanceRowProps {
  observer: ObserverMetadata;
  target: Element;
  targetIndex: number;
  /** intersectionRatio from $intersectionRatios store */
  ratio: number;
}

export function InstanceRow({
  observer,
  target,
  targetIndex,
  ratio,
}: InstanceRowProps): ReactNode {
  const { onMouseEnter: highlightEnter, onMouseLeave: highlightLeave } =
    useHighlight(target, observer.isZombie);
  const handleInspect = useInspect(target);

  const overlayId = `${observer.id}::${targetIndex}`;

  const onMouseEnter = () => {
    highlightEnter();
    // Spot Check — force-show overlay even if visuals are OFF or item is culled
    if (!observer.isZombie) {
      setForceShowId(overlayId);
    }
  };

  const onMouseLeave = () => {
    highlightLeave();
    setForceShowId(null);
  };

  return (
    <div
      className={`io-instance-row${observer.isZombie ? ' io-instance-row--zombie' : ''}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      title={
        observer.isZombie
          ? 'Target Node Detached. Memory Leak Detected.'
          : undefined
      }
    >
      {/* Col 1 — Thumbnail */}
      <Thumbnail target={target} />

      {/* Col 2 — Computed selector */}
      <span className="io-instance-row__selector">
        {observer.isZombie && <span aria-label="Detached">🔗💥 </span>}
        {computeSelector(target)}
      </span>

      {/* Col 3 — Real-time ratio */}
      <span className="io-instance-row__ratio">
        {(ratio * 100).toFixed(2)}%
      </span>

      {/* Col 4 — Visibility status */}
      <span className="io-instance-row__status">
        <span
          className={`io-status-dot${ratio > 0 ? '' : ' io-status-dot--inactive'}`}
          aria-label={ratio > 0 ? 'Visible' : 'Not visible'}
        />
      </span>

      {/* Col 5 — Actions */}
      <span className="io-instance-row__actions">
        {observer.isZombie ? (
          <button
            className="io-force-stop-btn"
            onClick={() => observer.instance.disconnect()}
            data-tooltip="Wywołuje .disconnect() natychmiast"
          >
            💀 Force Stop (Runtime)
          </button>
        ) : (
          <button
            className="io-inspect-btn"
            onClick={handleInspect}
            data-tooltip={
              'Click — scroll do elementu + flash\nShift+Click — console.log element'
            }
          >
            🔍
          </button>
        )}
      </span>
    </div>
  );
}
