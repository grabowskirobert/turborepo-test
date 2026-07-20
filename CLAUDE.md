# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
pnpm dev                    # Run all apps in parallel (turbo)
pnpm build                  # Build all packages and apps
pnpm lint                   # Lint all workspaces (0 warnings tolerance)
pnpm check-types            # Type-check all workspaces

# Per-workspace (run from root with --filter or cd into the workspace)
pnpm --filter web dev       # Next.js app on port 3001
pnpm --filter io-detector-devtools-extension dev   # Vite watch build for extension

# Quality gate (mirrors CI)
pnpm ci:is-working          # check-types + lint + build
```

Package manager: **pnpm** (v10). Node: **24**. Do not use npm or yarn.

## Architecture

Pnpm monorepo managed by Turborepo. Two apps, one core library package, and three shared config packages.

### Apps

- **`apps/web`** — Next.js 16 app (App Router, port 3001). Playground for learning RxJS and testing the IO Detector integration. Routes: `/rxjs-playground`, `/io-detector`.
- **`apps/io-detector-devtools-extension`** — Chrome DevTools extension (Vite + `@crxjs/vite-plugin`). Injects the IO Detector bundle into inspected pages via `chrome.scripting`. The bundle file (`io-detector.bundle.js`) is generated from `@repo/io-detector` and committed alongside the extension source.

### Core Package

**`packages/io-detector`** (`@repo/io-detector`) — The main library. Architecture layers:

```
domain/       — shared TypeScript types only (ObserverMetadata, ObserverGroup, etc.)
core/         — pure logic: monkey-patching IntersectionObserver, zombie detection,
                grouping, naming, smart queue, safety tiers, nanostores store
                Exposes ObserverRegistryPort (interface) — no UI dependencies
integration/  — DOM side-effects: shadow host mounting, visual overlay geometry
presentation/ — React components and hooks rendering the panel and overlays
```

Entry point `io-detector.tsx` exports `IODetector` (React component) and `createIODetectorInstance` (headless API). The component enforces a singleton via a module-level symbol and uses Shadow DOM to isolate styles. Dependency Inversion: core logic depends on `ObserverRegistryPort`, with the nanostores implementation injected at the composition root (`core/store/index.ts`).

### Shared Packages

- **`packages/ui`** — Shared React components + Tailwind CSS (built with `tsc` + `@tailwindcss/cli`)
- **`packages/eslint-config`** — Three configs: `base`, `next-js`, `react-internal`
- **`packages/tailwind-config`** — Shared Tailwind preset
- **`packages/typescript-config`** — Shared `tsconfig` bases

### Turbo Pipeline

`build` depends on `^build` (dependencies built first). `lint` and `check-types` also run after their deps. `dev` is persistent and uncached. Outputs cached: `dist/**`, `.next/**`.

### Git Hooks

- **pre-commit**: runs `lint-staged` (formats staged files with Prettier)
- **commit-msg**: validates against Conventional Commits (`@commitlint/config-conventional`)

Filenames must be kebab-case (enforced by ESLint config).
