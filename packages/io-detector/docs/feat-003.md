# Feature Requirements: Visual Debug Overlay

**Feature Title:** Visual Debug Overlay
**Version:** 2026-01-26
**Summary:** A high-performance visual debugging layer rendered via a React Portal. It projects colored overlays to represent `rootMargin` zones and intersection areas using additive blending. The system employs a "Dual-Loop" architecture and a "Three-Tier Safety System" to manage performance, automatically scaling behavior from full fidelity to partial rendering or auto-disabled safety based on observer volume. It guarantees application stability while offering powerful manual overrides for inspection.

**User Problem:** Developers currently debug Intersection Observers "blindly." In complex applications (e.g., infinite feeds), turning on debug tools can crash the browser due to rendering overhead. Developers need a tool that visualizes data where possible but actively protects the host application from performance degradation when data volume is critical.

**Acceptance Criteria:**

a. **Visual Visualization**

- The system must render the `rootMargin` buffer zone in **Magenta (rgba(255, 0, 255, 0.3))**.
- The system must highlight the intersecting portion of the element in **Neon Green (rgba(0, 255, 0, 0.3))**.
- The system must draw zone boundaries using **Yellow Dashed Lines (2px)**.
- **Additive Blending:** Overlapping overlays must use additive blending to visually indicate density.

b. **Technical Isolation & Safety**

- **Portal:** The UI must be rendered inside a **React Portal** to isolate styles.
- **Interaction:** The container must apply `pointer-events: none` to pass all clicks to the underlying app.
- **Z-Index:** The overlay must use a fixed value of **2147483647** (Max 32-bit Integer).

c. **Performance Architecture (Dual-Loop)**

- **Loop A (Priority Loop):** Runs throttled (e.g., every 200ms). It calculates metrics, sorts the "Smart Queue," and updates the list of the top 30 visible IDs.
- **Loop B (Render Loop):** Runs on `requestAnimationFrame` (every frame) to update CSS positions of the selected IDs.
- **Cheap Cull:** Inside Loop B, the system must perform a lightweight `isElementInViewport` check. If a selected element moves off-screen during the Loop A lag, its `opacity` must be set to `0` immediately to prevent visual artifacts.

d. **The "Three-Tier Safety System"**

- The system scans non-zombie observers (via `requestIdleCallback`) and applies one of three tiers:
- **Tier 1 (0–30 Observers):**
- **Visuals:** ON by default.
- **Rendering:** 100% of observers shown.
- **Status:** "🟢 System Active".
- **Tier 2 (31–50 Observers):**
- **Visuals:** ON by default.
- **Rendering:** Capped at Top 30 (via Smart Queue).
- **Status:** "⚠️ Visual Limit Reached (30/[Total] shown)".
- **Tier 3 (51+ Observers - "Safety Brake"):**
- **Visuals:** OFF by default.
- **Rendering:** 0 shown initially.
- **Status:** "⚠️ High Load (50+). Visuals disabled."

e. **The "Smart Queue" (Priority Logic)**

- Used in Tier 2 and Tier 3 (Override) to select the Top 30 overlays.
- **Sorting Criteria (Weighted):**

1.  **Tier A (Critical):** `isIntersecting: true`.
2.  **Tier B (Proximal):** Inside `rootMargin` but not intersecting.
3.  **Tier C (Focal):** Sorted by proximity to screen center.
4.  **Tier D (Background):** Off-screen elements.

- **Tie-Breaker:** Smallest **Surface Area** (Width × Height) wins.

f. **User Control & Overrides**

- **Manual Toggle:** The user can manually toggle Visuals ON even in Tier 3. The **Hard Limit of 30** still applies to prevent crashes.
- **Spot Check (Force-Show):** Hovering a row in the Monitor Panel (even if Visuals are globally OFF or the item is culled) must temporarily render that specific element's overlay immediately, ignoring all limits.
- **Hysteresis:** If the observer count drops from Tier 3 to Tier 1 during a session, the system must **not** auto-enable visuals; it remains in the user's last chosen state (OFF).

g. **Zombie Exclusion**

- Observers with null/detached targets ("Zombies") are strictly excluded from all visual rendering calculations.

**Out of Scope:**

- User-customizable colors or themes.
- Debugging observers inside iframes.
- Rendering >31 overlays simultaneously (30 Limit + 1 Force-Show).

**Dictionary:**

| Term                       | Definition                                                                                                                             |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **Dual-Loop Architecture** | A performance pattern separating heavy sorting logic (Loop A, low freq) from visual updates (Loop B, high freq).                       |
| **Safety Brake**           | The automatic disabling of visual features when the observer count exceeds 50 (Tier 3) to protect the host application.                |
| **Smart Queue**            | The priority algorithm (Intersection > Proximity > Center) used to select which 30 overlays to render in restricted tiers.             |
| **Cheap Cull**             | A lightweight check inside the high-frequency loop to immediately hide elements that move off-screen, preventing visual lag artifacts. |
| **Force-Show**             | A user interaction (hover) that bypasses rendering limits, forcing a specific element's overlay to appear temporarily for inspection.  |
