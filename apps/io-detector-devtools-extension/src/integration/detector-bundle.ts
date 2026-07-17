const BUNDLE_FILE = 'io-detector.bundle.js';

export async function loadDetectorBundleSource(): Promise<string> {
  const response = await fetch(chrome.runtime.getURL(BUNDLE_FILE));

  if (!response.ok) {
    throw new Error(`Failed to load ${BUNDLE_FILE}: ${response.status}`);
  }

  return response.text();
}
