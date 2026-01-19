# Product Requirements Document (PRD) - Intersection Observer Detector

**Version:** 1.0
**Status:** Approved for Development (MVP)

## Table of Contents

1. Glossary
2. Shared Concepts
3. Project Overview
4. User Problem
5. Functional Requirements
6. Project Scope
7. User Stories
8. Success Metrics

---

## 1. Glossary

- **Intersection Observer API (IO):** A browser API that allows code to track when an element enters a viewport.
- **rootMargin:** A virtual "buffer zone" around the viewport. Invisible by default, but crucial for the correct functioning of lazy loading.
- **Zombie Observers:** Observer instances that remain active in memory (Memory Leak) even though the observed DOM element has been removed.
- **Evergreen Browsers:** Modern browsers that update automatically (Chrome, Firefox, Edge, Safari). We ignore older versions and IE11.
- **Hybrid Architecture:** A design pattern separating the business logic of detection (pure TypeScript) from the presentation layer (React Components), enabling easy migration to a Chrome Extension in the future.

## 2. Project Overview

The "Intersection Observer Detector" project is a Developer Experience (DX) tool that makes the invisible visible. Currently, developers implementing lazy loading work "blindly," guessing parameters.

We are building a visual debugger (a React package based on a Hybrid Core) that overlays actual `rootMargin` zones on the screen, monitors visibility metrics in real-time, and catches memory leaks ("Zombie Observers"). The goal is to turn hours of console debugging into a split-second visual verification.

## 3. User Problem

The lack of insight into the Intersection Observer API in standard DevTools leads to four main problems:

- **Guesswork:** Developers cannot see virtual `rootMargin` zones, resulting in lazy-loading bugs (images loading too late or too early).
- **Memory Leaks (Zombies):** In SPA applications (React/Vue), it is easy to leave non-disconnected observers after unmounting a component, which degrades performance.
- **Animation Difficulties:** Lack of a preview for `intersectionRatio` makes precise synchronization of effects (e.g., parallax) difficult.
- **3rd-party Chaos:** Difficulty in distinguishing one's own observers from those injected by external scripts (ads, analytics).

## 4. Functional Requirements

| ID              | Category    | Requirement Description                                                                                                                                                                                                                         | Priority      |
| :-------------- | :---------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------ |
| **FR-ARCH-001** | **CORE**    | The system must be built on a Hybrid Architecture: Detection logic (monkey patch) in pure TS, UI in React.                                                                                                                                      | P0 (Critical) |
| **FR-VIS-002**  | **VISUAL**  | The `rootMargin` overlay must use **Magenta (rgba(255, 0, 255, 0.3))** for high contrast.                                                                                                                                                       | P1            |
| **FR-VIS-003**  | **VISUAL**  | The visible area of the target element must use **Neon Green (rgba(0, 255, 0, 0.3))**.                                                                                                                                                          | P1            |
| **FR-VIS-004**  | **VISUAL**  | Zone guidelines must be rendered as **Yellow Dashed Lines (2px)**.                                                                                                                                                                              | P1            |
| **FR-MON-005**  | **MONITOR** | The "Live Monitor" panel displays the current `intersectionRatio` and crossed `thresholds`.                                                                                                                                                     | P0            |
| **FR-MEM-006**  | **MEMORY**  | The "Zombie Hunter" feature flags observers in the list whose target element no longer exists in the DOM.                                                                                                                                       | P0            |
| **FR-COMP-007** | **COMPAT**  | The system must detect the presence of the native API. If missing (`!window.IntersectionObserver`), the system silently aborts operation.                                                                                                       | P1            |
| **FR-SAFE-008** | **SAFETY**  | The tool's UI must be rendered in a **React Portal** to isolate the tool's styles from the user application's styles (avoiding CSS conflicts).                                                                                                  | P0            |
| **FR-ENV-009**  | **SAFETY**  | Dev-Only Execution: The tool must verify the NODE_ENV variable. If the value is not 'development', the library code must be excluded from the bundle (tree-shaking) or immediately abort execution to avoid performance overhead on production. | P0 (Critical) |

## 5. Project Scope

### In Scope for MVP

- **React Package:** Distribution via npm as a library easy to plug into React.
- **Modern Browsers Only:** Chrome, Firefox, Edge, Safari (last 2 major versions).
- **Hardcoded Visuals:** No ability for the user to change colors (Zero Config).
- **Hybrid Core:** Separation of logic from the view (paving the way for a future Chrome Extension).
- **Monkey Patching:** Intercepting the global `IntersectionObserver` constructor.

### Out of Scope for MVP

- **Chrome Extension:** Deferred to the "Scaling" phase.
- **UI Configuration:** No "color pickers," theme changes, or font resizing.
- **Legacy Support:** No support for IE11. No handling/detection of polyfills.
- **SSR Hydration Fixes:** Complex hydration errors are left for the stabilization phase (post-MVP).

## 6. Success Metrics

- **Activation Rate:** > 60% of developer sessions with the imported tool end with interaction with the panel (click, inspection).
- **Zombie Kill Rate (Value Metric):** Detection of at least one "Zombie Observer" or implementation error in 30% of tested projects.
- **Zero Config Success:** 100% successful launches without the need to modify application code (other than the import).
- **Crash-Free Users:** 100% (thanks to `try-catch` isolation and lack of support for unstable legacy browsers).

---
