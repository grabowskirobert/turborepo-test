/**
 * FEAT-002 — EmptyState
 *
 * Displayed when $observers store is empty.
 *
 * @see feat-002.md § A. Panel Layout — Empty State
 */
import type { ReactNode } from 'react';

/**
 * Layout complete — all text content matches feat-002.md § A.
 * Pulsing green dot animation defined in detector.css (.io-pulse-dot + @keyframes io-pulse).
 */
export function EmptyState(): ReactNode {
  return (
    <div className="io-empty-state">
      <span className="io-pulse-dot" aria-hidden="true" />
      <p className="io-empty-state__status">
        System Active. Monitoring Global IntersectionObserver.
      </p>
      <p className="io-empty-state__cta">
        No Observers detected yet. Scroll the page or trigger a lazy-loaded
        component to see data.
      </p>
    </div>
  );
}
