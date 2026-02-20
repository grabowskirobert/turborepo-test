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

interface InstanceRowProps {
  observer: ObserverMetadata;
  target: Element;
  targetIndex: number;
  /** intersectionRatio from $intersectionRatios store */
  ratio: number;
}

/**
 * TODO(feat-002): implement living row
 *   - <Thumbnail target={target} />
 *   - computeSelector(target) → display computed CSS selector (§ C.2)
 *   - ratio.toFixed(4) → display real-time ratio (§ C.3)
 *   - ratio > 0 → ✅ status icon (§ C.4)
 *   - onMouseEnter/onMouseLeave → useHighlight(target, false) (§ D hover-to-highlight)
 *   - inspect icon button (.io-inspect-btn) → pass onClick={handleInspect}
 *     handleInspect receives MouseEvent → useInspect checks event.shiftKey internally (§ D)
 *
 * TODO(feat-002): implement zombie variant (observer.isZombie === true)
 *   - className += " io-instance-row--zombie" (CSS handles cursor: not-allowed + red bg)
 *   - 💀 icon next to name, 🔗💥 broken-link icon for detached state (§ E Visual Identification)
 *   - NO highlight on hover — useHighlight already guards via isZombie param (§ E Inverted Feedback Loop)
 *   - title tooltip: "Target Node Detached. Memory Leak Detected." (§ E Inverted Feedback Loop)
 *   - "Force Stop (Runtime)" button (.io-force-stop-btn, hollow red border)
 *     → onClick: observer.instance.disconnect() — no confirmation modal (§ E Force Stop)
 */
export function InstanceRow({
  observer,
  target,
  targetIndex,
  ratio,
}: InstanceRowProps): ReactNode {
  const { onMouseEnter, onMouseLeave } = useHighlight(
    target,
    observer.isZombie,
  );
  const handleInspect = useInspect(target);

  // TODO(feat-002): implement — replace stub below
  void targetIndex;
  void ratio;
  void computeSelector;
  void handleInspect;

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
      <Thumbnail target={target} />
      {/* TODO(feat-002): computed selector via computeSelector(target) */}
      {/* TODO(feat-002): ratio display — ratio.toFixed(4) */}
      {/* TODO(feat-002): status icon — ratio > 0 ? '✅' : indicator */}
      {/* TODO(feat-002): zombie icons — 💀 + 🔗💥 when observer.isZombie */}
      {/* TODO(feat-002): inspect button (.io-inspect-btn) — onClick={handleInspect} (handles Shift+Click internally) */}
      {/* TODO(feat-002): force stop button (.io-force-stop-btn) — only when observer.isZombie
           onClick: () => observer.instance.disconnect() */}
      <span className="io-instance-row__placeholder">TODO</span>
    </div>
  );
}
