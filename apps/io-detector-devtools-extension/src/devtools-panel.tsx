/**
 * IO Detector DevTools Panel.
 *
 * Renders a toggle ON/OFF. ON reloads the inspected page with
 * `io-detector.bundle.js` injected before page scripts, so the monkey patch
 * sees IntersectionObserver instances created during app boot. OFF destroys
 * the current detector via `window.__IO_DETECTOR__.destroy()`.
 */
import { StrictMode, useCallback, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

const BUNDLE_FILE = 'io-detector.bundle.js';
const enabledMessage = 'Reloading page to patch IntersectionObserver early…';

type Status = 'unknown' | 'active' | 'inactive';

interface ScriptingResult<T> {
  result?: T;
  frameId?: number;
}

async function isDetectorActive(tabId: number): Promise<boolean> {
  const results = (await chrome.scripting.executeScript({
    target: { tabId },
    world: 'MAIN',
    func: () =>
      !!(window as unknown as { __IO_DETECTOR__?: unknown }).__IO_DETECTOR__,
  })) as ScriptingResult<boolean>[];
  return results[0]?.result === true;
}

async function loadBundleSource(): Promise<string> {
  const response = await fetch(chrome.runtime.getURL(BUNDLE_FILE));
  if (!response.ok) {
    throw new Error(`Failed to load ${BUNDLE_FILE}: ${response.status}`);
  }
  return response.text();
}

async function reloadWithEarlyPatch(): Promise<void> {
  const bundleSource = await loadBundleSource();
  chrome.devtools.inspectedWindow.reload({ injectedScript: bundleSource });
}

async function destroyDetector(tabId: number): Promise<void> {
  await chrome.scripting.executeScript({
    target: { tabId },
    world: 'MAIN',
    func: () => {
      const w = window as unknown as {
        __IO_DETECTOR__?: { destroy: () => void };
      };
      w.__IO_DETECTOR__?.destroy();
    },
  });
}

function ToggleApp() {
  const [status, setStatus] = useState<Status>('unknown');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const tabId = chrome.devtools.inspectedWindow.tabId;
  // tabId is -1 when DevTools is attached to a non-inspectable target
  // (e.g. chrome:// pages, DevTools-on-DevTools). Guard against that
  // before calling any chrome.scripting API.
  const isRegularWebTab = tabId >= 0;

  const syncStatus = useCallback(async () => {
    if (!isRegularWebTab) return;
    try {
      const active = await isDetectorActive(tabId);
      setStatus(active ? 'active' : 'inactive');
      setError(null);
      if (!active) setMessage(null);
    } catch (err) {
      setStatus('inactive');
      setError(err instanceof Error ? err.message : String(err));
    }
  }, [tabId, isRegularWebTab]);

  useEffect(() => {
    void syncStatus();
    // Re-sync after the inspected page navigates: the bundle is gone from
    // the new document, so we need to reset status back to 'inactive'.
    chrome.devtools.network.onNavigated.addListener(syncStatus);
    return () => {
      chrome.devtools.network.onNavigated.removeListener(syncStatus);
    };
  }, [syncStatus]);

  const toggle = useCallback(async () => {
    if (!isRegularWebTab || pending) return;
    setPending(true);
    setError(null);
    try {
      if (status === 'active') {
        await destroyDetector(tabId);
        setMessage(null);
        await syncStatus();
      } else {
        await reloadWithEarlyPatch();
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

  const statusLabels: Record<Status, string> = {
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

const container = document.getElementById('root');
if (container) {
  createRoot(container).render(
    <StrictMode>
      <ToggleApp />
    </StrictMode>,
  );
}
