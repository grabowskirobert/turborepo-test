## Why

There is no personal, always-on place to write and organize Markdown notes with rich rendering (code + diagrams). This change adds a single-user note app to the monorepo — hosted for free, auto-saving, and rendering Markdown including Mermaid diagrams — so notes are captured without friction and never lost.

## What Changes

- Add a new Next.js 16 app at `apps/notes` (React 19, Tailwind 4), running on port **3002**, following the io-detector layered architecture (`domain` / `core` / `infrastructure` / `integration` / `presentation`).
- Introduce **Supabase** (Postgres + Auth) as the backend, injected into `core` via a `NoteRepository` port (Dependency Inversion). Hosted on Vercel.
- **Authentication** locked to a single owner account via Supabase Auth + Row Level Security.
- **One-level folders** (folders cannot nest) and **Markdown notes** inside them, with full CRUD.
- **Autosave** with a 1s debounce that flushes on note-switch and in-app route change, plus a `beforeunload` guard when an edit is unsaved.
- **Always-editable split-pane editor** (edit ǀ live preview, no toggle).
- **Markdown rendering** via `react-markdown` + `remark-gfm`, code highlighting via `shiki`, and Mermaid diagrams via the `mermaid` package (custom renderer intercepting ` ```mermaid ` fences).
- **Archive (soft delete)**: deleting a note archives it; deleting a folder cascade-archives its notes and requires a second confirmation; the archive supports permanent deletion.
- Image embedding is explicitly **out of scope** for this MVP.

## Capabilities

### New Capabilities

- `notes-authentication`: Single-owner sign-in and access control (Supabase Auth + RLS) gating all note data.
- `notes-organization`: One-level folder structure and Markdown notes within folders, with CRUD.
- `notes-editor`: Always-editable split-pane editor with debounced autosave, flush-on-navigation, and unsaved-edit guard.
- `notes-markdown-rendering`: Rendering of GitHub-flavored Markdown, syntax-highlighted code blocks, and Mermaid diagrams.
- `notes-archive`: Soft-delete of notes and cascade-archive of folders (with confirmation), plus permanent deletion from the archive.

### Modified Capabilities

<!-- None — this is a greenfield app with no existing specs. -->

## Impact

- **New app**: `apps/notes` (added to the pnpm workspace and Turbo pipeline; new port 3002).
- **New dependencies**: `@supabase/supabase-js` (and `@supabase/ssr` for Next.js auth), `react-markdown`, `remark-gfm`, `mermaid`. Reuses `shiki` (already in the repo) and shared `@repo/ui`, `@repo/eslint-config`, `@repo/tailwind-config`, `@repo/typescript-config`.
- **External services**: a Supabase project (Postgres + Auth) and a Vercel deployment; environment variables for Supabase URL/keys.
- **No changes** to existing apps or packages.
