/**
 * DevTools entry — registers the "IO Detector" panel.
 *
 * Runs in Chrome's DevTools extension page context. Has access to
 * `chrome.devtools.*` APIs but limited to a few permissions until the
 * panel itself is opened.
 */
chrome.devtools.panels.create(
  'IO Detector',
  'icons/32.png',
  'src/panel.html',
  () => {
    /* panel created */
  },
);
