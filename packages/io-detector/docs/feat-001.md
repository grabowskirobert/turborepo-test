# Feature Requirements Document

## Feature Title: Foundation & Technical Setup

**Version:** 2026-01-22
**Summary:**
This feature establishes the architectural skeleton of the Intersection Observer Detector. It focuses on setting up the "Hybrid Architecture" wrapped in a **single React Component**. This component manages the lifecycle of the detection logic (init on mount, destroy on unmount), ensuring safety guards (environment checks, safe HMR teardown) and style/event isolation (Shadow DOM) are applied automatically.

## User Problem

Developers need a DX tool that is safe and easy to install in a React environment. They face six specific risks:

- **Production Bloat:** Accidentally shipping debug code to end-users.
- **Legacy Crashes:** The tool breaking the application on older browsers.
- **HMR Chaos:** Frequent code reloads causing duplicate observers or memory leaks.
- **Style Conflicts:** Debugger styles bleeding into the app.
- **Event Interference:** Interaction with the tool accidentally triggering event listeners in the host app.
- **UI Crashes:** A bug in the detector freezing the app.

## Acceptance Criteria

### 1. Public API: The React Wrapper

- a. **Named Export:** The package must export a single named React component (e.g., `<IODetector />`).
- b. **Lifecycle Binding:**
- - **On Mount:** The component triggers the initialization logic (Safety checks -> Monkey Patching -> DOM Injection).

- - **On Unmount:** The component triggers the `destroy()` logic (Un-patching -> Cleanup).

- c. **Null Render:** The component itself must return `null` (or a Portal) to avoid affecting the JSX layout where it is placed.
- d. **Singleton Enforcement:** If multiple `<IODetector />` components are mounted, the system must ensure only one active detector instance exists (e.g., by destroying the previous one or ignoring the new one).

### 2. Environment Safety Guard (FR-ENV-009)

- a. **Development Check:** The component logic must verify `import.meta.env.DEV` (Vite Library Mode).
- - If `false`, the component renders nothing and executes no logic.

- - Build must support tree-shaking.

### 3. Browser Compatibility Check (FR-COMP-007)

- a. **API Existence:** Check for `window.IntersectionObserver`.
- - If missing: Abort, log warning to console.

### 4. Hybrid Architecture & Logic (FR-ARCH-001)

- a. **Core Separation:** Monkey-patching logic remains in pure TypeScript (`Core/`), isolated from the UI.
- b. **HMR Safety (destroy):**
- - Explicitly restore `window.IntersectionObserver` to its original state.

- - Remove injected DOM nodes.

#### 4.5. State Management (The Bridge)

- Technology: Use Nanostores for state synchronization between Pure TS Core and React UI.
- Store Structure:
- - $observers: An atom/map containing the registry of active observers and their metadata.
- - $uiConfig: Stores UI state (collapsed/expanded, current inspection mode).
- Write Strategy (Core): The Core Logic updates the stores. Updates must be batched (throttled) to avoid React re-render thrashing (e.g., max 1 update per frame or every 100ms for lists).
- Read Strategy (React): Components use useStore() hook to subscribe only to relevant slices of state.

#### 4.6. Core Logic: Garbage Collection & Zombie Detection

- Polling Mechanism: Implement a lightweight polling loop (e.g., setInterval running every 2000ms or requestIdleCallback) separate from the high-frequency render loop.
- Detection Logic: Iterate through the active Observer Registry.
- The Check: For each observer target, check the .isConnected property.
- - If target.isConnected === false: Mark the observer instance as a "Zombie" in the Nanostore state (isZombie: true).
- - This state update triggers the UI warnings defined in FEAT 2.

### 5. DOM Injection & Shadow DOM

- a. **Shadow Host:** The component creates a container (e.g., `<div id="__io-detector-root">`) appended to `document.body`.
- b. **Shadow Root:** Attach `shadowRoot` (`mode: 'open'`) to the host.
- c. **React Portal:** The actual Debugger UI is rendered via `createPortal` _into_ this Shadow Root.

### 6. CSS Injection Strategy

- a. **Raw Import:** CSS must be imported as raw strings (e.g., `import styles from './styles.css?inline'`).
- b. **Injection:** The system must inject a `<style>` tag containing these styles directly into the Shadow Root during initialization.

### 7. Visual & Interaction Isolation

- a. **Z-Index:** Shadow Host uses `z-index: 2147483647` and `position: fixed`.
- b. **Event Propagation:** Stop propagation of `click`, `mousedown`, and `keydown` events at the Shadow Host level.
- c. **Error Boundary:** The inner UI is wrapped in an Error Boundary.
- d. **Strict Mode:** The inner UI is wrapped in `<React.StrictMode>`.
- e. Internal Layering (Stacking Context): Within the Shadow Root, strict Z-Index layers must be defined via CSS variables or fixed rules to prevent the Overlay from blocking the UI Panel:
- - Layer 1 (Bottom): Visual Overlay Canvas (z-index: 10) - Defined in FEAT 3.
- - Layer 2 (Top): Monitor Panel & Controls (z-index: 9999) - Defined in FEAT 2.
- - Note: Both layers sit inside the Host which has the max browser Z-Index (2147483647).

## Out of Scope

- Implementation of visual overlays.
- Zombie Hunter logic.
- Polyfills.

## Dictionary

| Term                    | Definition                                                                                                         |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------ |
| **Hybrid Architecture** | Business logic in pure TS, UI in React.                                                                            |
| **Shadow DOM**          | Encapsulated DOM tree for style isolation.                                                                         |
| **Raw Import**          | Importing a file's content as a string (Vite `?inline`), allowing manual injection into Shadow DOM `<style>` tags. |
| **React Portal**        | A React feature to render children into a DOM node that exists outside the DOM hierarchy of the parent component.  |
