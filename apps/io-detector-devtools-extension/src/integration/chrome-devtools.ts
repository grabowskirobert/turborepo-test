import { loadDetectorBundleSource } from './detector-bundle';

export function getInspectedTabId(): number {
  return chrome.devtools.inspectedWindow.tabId;
}

export function onInspectedPageNavigated(listener: () => void): VoidFunction {
  chrome.devtools.network.onNavigated.addListener(listener);

  return () => {
    chrome.devtools.network.onNavigated.removeListener(listener);
  };
}

export async function reloadWithEarlyPatch(): Promise<void> {
  const injectedScript = await loadDetectorBundleSource();

  chrome.devtools.inspectedWindow.reload({ injectedScript });
}
