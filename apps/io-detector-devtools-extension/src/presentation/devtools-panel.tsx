/**
 * IO Detector DevTools Panel.
 *
 * Renders a toggle ON/OFF. ON reloads the inspected page with
 * `io-detector.bundle.js` injected before page scripts, so the monkey patch
 * sees IntersectionObserver instances created during app boot. OFF destroys
 * the current detector via `window.__IO_DETECTOR__.destroy()`.
 */
import { useCallback, useEffect, useState } from 'react';
import type { DetectorStatus } from '../domain/detector-status';
import {
  disableDetector,
  enableDetector,
  enabledMessage,
  getDetectorStatus,
} from '../core/detector-controller';
import {
  getInspectedTabId,
  onInspectedPageNavigated,
} from '../integration/chrome-devtools';

export function DevtoolsPanel() {
  const [status, setStatus] = useState<DetectorStatus>('unknown');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const tabId = getInspectedTabId();
  // tabId is -1 when DevTools is attached to a non-inspectable target
  // (e.g. chrome:// pages, DevTools-on-DevTools). Guard against that
  // before calling any chrome.scripting API.
  const isRegularWebTab = tabId >= 0;

  const syncStatus = useCallback(async () => {
    if (!isRegularWebTab) return;

    try {
      const nextStatus = await getDetectorStatus(tabId);
      setStatus(nextStatus);
      setError(null);
      if (nextStatus !== 'active') setMessage(null);
    } catch (err) {
      setStatus('inactive');
      setError(err instanceof Error ? err.message : String(err));
    }
  }, [tabId, isRegularWebTab]);

  useEffect(() => {
    void syncStatus();
    // Re-sync after the inspected page navigates: the bundle is gone from
    // the new document, so we need to reset status back to 'inactive'.
    return onInspectedPageNavigated(syncStatus);
  }, [syncStatus]);

  const toggle = useCallback(async () => {
    if (!isRegularWebTab || pending) return;

    setPending(true);
    setError(null);

    try {
      if (status === 'active') {
        await disableDetector(tabId);
        setMessage(null);
        await syncStatus();
      } else {
        await enableDetector();
        setStatus('active');
        setMessage(enabledMessage);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setPending(false);
    }
  }, [pending, syncStatus, status, tabId, isRegularWebTab]);

  if (!isRegularWebTab) {
    return (
      <div className="panel">
        <h1>IO Detector</h1>
        <div className="error">
          DevTools attached to invalid target (tabId={String(tabId)}). Open
          DevTools on a regular web page and reopen this panel.
        </div>
      </div>
    );
  }

  const statusLabels: Record<DetectorStatus, string> = {
    unknown: '…',
    active: 'Active',
    inactive: 'Inactive',
  };
  const label = statusLabels[status];

  return (
    <div className="panel">
      <h1>IO Detector</h1>
      <p>
        Reloads the inspected page with an early IntersectionObserver patch.
        Visual overlay + monitor panel appear directly on the page in a Shadow
        DOM.
      </p>
      <div className={`status ${status}`}>
        <span className="status-dot" />
        <span>{label}</span>
      </div>
      <button
        type="button"
        className={`toggle ${status === 'active' ? 'active' : ''}`}
        onClick={() => void toggle()}
        disabled={pending || status === 'unknown'}
      >
        {status === 'active' ? 'Turn OFF' : 'Turn ON'}
      </button>
      {message ? <div className="message">{message}</div> : null}
      {error ? <div className="error">{error}</div> : null}
    </div>
  );
}
