# Feature Requirements: Live Monitor Panel

**Feature Title:** Feature B: Live Monitor Panel
**Version:** 2026-01-26 (Final)

**Summary:**
The Live Monitor Panel is a real-time, collapsible dashboard docked to the bottom-right of the viewport. It aggregates active Intersection Observers by their functional signature (root + margin + thresholds) to reduce visual clutter. The panel features a "Weighted Fallback System" for smart naming, a "Fingerprint" view for individual instances (including strict thumbnail rendering), and specific workflows for handling "Zombie Observers," including a safe "Force Stop (Runtime)" action.

**User Problem:**
Developers struggle with "console noise" and lack context when debugging observers. They cannot distinguish between multiple anonymous observers, identify specific DOM targets without clicking, or safely verify if a "Zombie" observer is the cause of performance degradation.

**Acceptance Criteria:**

- **A. Panel Layout & Positioning**
- **Position:** Fixed to the **Bottom-Right** of the viewport.
- **Collapsible:** The user can toggle the panel between "Expanded" (full view) and "Collapsed" (minimized tab) states.
- **Empty State:** If no observers are detected:
- Display status: "System Active. Monitoring Global IntersectionObserver."
- Visual: A subtle pulsing **Green Dot** animation.
- Call to Action: "No Observers detected yet. Scroll the page or trigger a lazy-loaded component to see data."

- **B. Smart Naming & Aggregation (Weighted Fallback System)**
- The system must name observer groups based on the following priority order:

1. **Explicit Function Name:** Use the name of the callback function (e.g., `handleImageFade`).
2. **Target Data-Attribute:** Use the `data-io-name` value if present on the first target (e.g., "HeroLazyLoad").
3. **Target Tag Inference:** If the group is homogeneous (all targets are the same tag), use syntax like `Observer (<img>)`.
4. **Fallback:** `Anonymous Observer #{ID}`.

- **C. Detailed Instance List ("Fingerprint" Row)**
- When a group is expanded, each instance row must display:

1. **Thumbnail (Strict):**
   - Render only if the target is an `<img>` tag or has a computed `background-image`.
   - Must use `<img loading="lazy">` for performance.
   - **Limit:** Max 50 active thumbnails per session. Stop rendering thumbnails after this limit is reached.
2. **Computed Selector:** A constructed string using **Sibling Index**. Format example: `div.product-card` or `li:nth-of-type(3)`.
3. **Real-Time Ratio:** The `intersectionRatio` displayed to 4 decimal places (e.g., `0.5342`).
4. **Status Icon:** An indicator of visibility (e.g., `✅` if visible).

- **D. Interaction: Reverse Lookup & Inspection**
- **Hover-to-Highlight:** Hovering over a valid (living) observer row must visually highlight the corresponding target element in the DOM.
- **Inspect Icon Action:**
- **Click:** Triggers `element.scrollIntoView({ behavior: 'smooth', block: 'center' })` AND a temporary "Flash" effect (Bright Blue Border) on the target element.
- **Shift + Click:** Logs the raw DOM element to the console with the prefix `[IO-Detector] Target Element:`.

- **E. Zombie Hunter Integration & "Force Stop"**
- **Visual Identification:**
- **Row Background:** Changes to **Washed-out Red (rgba(255, 0, 0, 0.1))**.
- **Icon:** A **Skull Icon (💀)** appears next to the observer name.
- **Visual Distinction:** A "Broken Link" icon (🔗💥) represents the detached state.

- **Inverted Feedback Loop (Zombie Hover):**
- **Canvas:** Do **NOT** render any highlight on the screen (prevent phantom boxes).
- **Cursor:** Change mouse cursor to `not-allowed` (🚫).
- **Tooltip:** Display text: "Target Node Detached. Memory Leak Detected."

- **Debug Action: Force Stop (Runtime):**
- Provide a button labeled **"Force Stop (Runtime)"** for Zombie instances.
- **Style:** Hollow Red Border (High contrast, warning style).
- **Behavior:** Executes `.disconnect()` on the specific instance immediately.
- **UX:** No confirmation modal.

**Out of Scope:**

- **Source Code Editing:** The "Force Stop" action is runtime only; it does not persist to the codebase.
- **Historical Graphing:** No history of values or charts.
- **Deep Thumbnails:** No thumbnail generation for generic divs without background images.

**Dictionary:**

| Term                         | Definition                                                                                                                |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **Weighted Fallback System** | A logic hierarchy used to determine the most human-readable name for an observer group (Function > Data Attr > Tag > ID). |
| **Sibling Index**            | The precise position of an element relative to its parent (e.g., `nth-of-type(3)`), used for the Computed Selector.       |
| **Force Stop (Runtime)**     | A non-destructive debug action that disconnects an observer in the current browser session to test performance fixes.     |
| **data-io-name**             | The standardized data attribute used to manually name observers for easier debugging within the tool.                     |
| **Flash Effect**             | A temporary visual cue (border/overlay) applied to a DOM element when the user clicks "Inspect" to confirm its location.  |
