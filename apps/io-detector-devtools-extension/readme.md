# IO Detector — DevTools Extension

DevTools-integrated launcher for [`@repo/io-detector`](../../packages/io-detector). Adds an **IO Detector** tab to Chrome DevTools with a single ON/OFF toggle. When enabled, the inspected page is reloaded with the detector bundle injected before page scripts run, so `IntersectionObserver` is patched before the app creates observers.

## Development

```bash
# From repo root
pnpm install
pnpm --filter @repo/io-detector build   # produces packages/io-detector/dist/io-detector.js
pnpm --filter io-detector-devtools-extension build # produces apps/io-detector-devtools-extension/dist/

# Watch mode (turbo dev or per-app)
pnpm --filter io-detector-devtools-extension dev
```

Load in Chrome:

1. Open `chrome://extensions/`
2. Enable **Developer mode**
3. **Load unpacked** → select `apps/io-detector-devtools-extension/dist/`
4. Open DevTools on any page → **IO Detector** tab → click **Turn ON**

After code changes: rebuild and hit the reload button on the extension card in `chrome://extensions/`. DevTools panel reload follows automatically on next open.

## How it works

```
┌────────────────────────────────────┐
│ DevTools Panel (this extension)    │
│  - React UI                        │
│  - chrome.devtools.inspectedWindow │
└──────────┬─────────────────────────┘
           │ chrome.devtools.inspectedWindow.reload
           │   { injectedScript: io-detector.bundle.js }
           ▼
┌────────────────────────────────────┐
│ Inspected page (main world)        │
│  - io-detector.bundle.js (auto-init)│
│  - window.__IO_DETECTOR__ = {destroy}│
│  - <div id="io-detector-host">     │
│       └── ShadowRoot (overlay+panel)│
└────────────────────────────────────┘
```

- **Inject**: `chrome.devtools.inspectedWindow.reload({ injectedScript })`, where `injectedScript` is the built `io-detector.bundle.js` source. This runs before page scripts during reload, allowing the monkey patch to observe app-created `IntersectionObserver` instances.
- **Probe state**: small inline function checking `!!window.__IO_DETECTOR__`.
- **Destroy**: calls `window.__IO_DETECTOR__.destroy()` — unmounts React, removes host element, restores the original `IntersectionObserver`.
- **Auto re-check on navigation**: `chrome.devtools.network.onNavigated` listener forces a status refresh after the page reloads. State is per-document; user clicks **Turn ON** again after later manual reloads.

The `io-detector.bundle.js` is the same code that powers `@repo/io-detector`, only rebuilt with `auto-init.ts` as the entry and React inlined. It's staged into `public/` during the extension build and copied through to `dist/`.

## Permissions

| Permission                         | Why                                                                                                        |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `scripting`                        | Required by `chrome.scripting.executeScript` for state probe and teardown functions in the inspected page. |
| `host_permissions: ["<all_urls>"]` | Allows injection on any site the user inspects. Same pattern as React DevTools.                            |
| `web_accessible_resources`         | Declares `io-detector.bundle.js` so the DevTools panel can fetch its source before reload injection.       |

No content scripts, no background service worker. The DevTools panel itself drives all injection.

## Caveats

- State is per-tab and not persisted. Reloading the inspected page resets the detector to OFF; user clicks **Turn ON** again.
- If DevTools is opened on a `chrome://` URL, the file scheme, or the DevTools window itself, `tabId` will be `-1` and the panel renders an error state.
- The bundle injects its own React 19 alongside whatever React the host page uses. Shadow DOM isolates UI; tools like React DevTools may pick up both Reacts.
