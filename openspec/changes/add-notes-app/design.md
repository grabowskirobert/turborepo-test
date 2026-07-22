## Context

`apps/notes` is a new single-user Markdown note app added to this pnpm/Turbo monorepo. It reuses the repo's stack (Next.js 16, React 19, Tailwind 4, `shiki`) and the layered architecture already established in `packages/io-detector` (`domain` / `core` / `infrastructure` / `integration` / `presentation`). The backend is Supabase (Postgres + Auth), hosted on Vercel. The app is for a single owner; multi-tenant concerns are out of scope, but data must still be protected by Row Level Security so the deployed instance is not world-readable.

Motivation is in `proposal.md`; behavioral requirements are in `specs/`.

## Goals / Non-Goals

**Goals:**

- A layered app where business logic (`core`) is framework- and backend-agnostic, depending only on a `NoteRepository` port; the Supabase implementation is injected at a composition root.
- One-level folders + Markdown notes with CRUD, soft-delete archive with restore, and cascade semantics that keep data consistent.
- Always-editable split-pane editor with debounced autosave that never silently loses an edit.
- Markdown preview with GFM, `shiki` code highlighting, and `mermaid` diagrams.
- Free hosting (Vercel) + free backend (Supabase free tier).

**Non-Goals:**

- Image upload/embedding (explicitly deferred).
- Nested folders, sharing, collaboration, multi-user accounts.
- Full-text search, tags, or export.
- Offline-first / local persistence.

## Decisions

### Backend: Supabase over Firebase

Chosen for a relational model that fits folders→notes naturally, built-in Auth, RLS for single-owner protection, and a free tier that **retains data when a project is paused** (pause ≠ deletion). Firebase was the user's initial default but was set aside because (a) new-project Storage now requires a billing card and (b) the relational shape here is cleaner in Postgres. Idle-pause is acceptable because the owner uses the app regularly.

### Layered architecture with a repository port (Dependency Inversion)

`core` exposes a `NoteRepository` interface (in `core/ports/`) covering folder/note CRUD, archive/restore, and permanent-delete. `infrastructure/supabase/` provides the concrete implementation. Use-cases in `core/use-cases/` (e.g. `cascade-archive-folder`, `restore-folder`, `permanent-delete-folder`) express the cascade/restore invariants independent of Supabase, so they are unit-testable without a network. A composition root wires the Supabase repository into the store. `domain/` holds types only (`Folder`, `Note`, ids). State lives in `core/store/`. `integration/` is thin — only the `beforeunload` guard (a browser-host side effect). `presentation/` holds React components/hooks/styles. `app/` is Next.js routing only and stays thin.

Alternative considered: putting Supabase calls directly in React hooks. Rejected — it couples cascade logic to the framework and the backend, and mirrors neither the repo's io-detector convention nor the DIP requirement.

### Data model

Two tables, both with an `owner_id` (uuid, = `auth.uid()`) and RLS policies restricting all rows to the owner:

```
folders  ( id, owner_id, name, created_at, deleted_at NULL )
notes    ( id, owner_id, folder_id → folders.id, title,
           markdown, updated_at, deleted_at NULL )
```

- One-level folders: `folders` has **no** parent reference — nesting is structurally impossible.
- Soft delete: `deleted_at NULL` = active; non-null = archived. Active listings filter `deleted_at IS NULL`.
- Cascade-archive/restore and cascade permanent-delete are handled in `core` use-cases (not DB triggers) so the invariants are explicit and testable. `notes.folder_id` uses `ON DELETE CASCADE` as a backstop for permanent folder deletion.

### Autosave: debounce + flush + unload guard

A 1s debounce coalesces keystrokes. The pending write is **flushed** (fired immediately, debounce cancelled) on note-switch and in-app route change, so switching away never drops an edit. A `dirty` flag in the store drives a `beforeunload` handler (in `integration/`) that triggers the browser's native prompt only while unsaved. Flush-on-switch keeps the unguarded window to ~1s, limited to full tab-close/reload where a custom message is impossible anyway.

### Markdown rendering

`react-markdown` + `remark-gfm` for GFM. A custom `code` component renderer inspects the fence language: `mermaid` → render via the `mermaid` package into a container (with error boundary / try-catch so invalid diagrams show an inline error without breaking the preview); everything else → `shiki` highlighting (reusing the version already in the repo). Because preview is always live, rendering is memoized on the Markdown string to avoid re-highlighting on every keystroke.

### Auth / access control

Supabase Auth for sign-in; a Next.js middleware (or server-side session check via `@supabase/ssr`) redirects unauthenticated visitors to the sign-in route. Access is restricted to the single owner by RLS policies keyed on `auth.uid()`; a non-owner authenticated session simply sees no rows.

## Risks / Trade-offs

- **Supabase free-tier pause** → Data is retained; the owner restores from the dashboard. Acceptable given regular use; low likelihood of triggering.
- **Cascade logic in application code can drift from DB state** (e.g., partial failure mid-cascade) → Perform cascade archive/restore/permanent-delete as a single Supabase RPC/transaction where feasible; keep use-case logic the single source of truth and cover the invariants (esp. "every archived note keeps a folder") with unit tests.
- **`mermaid` bundle size / SSR** → `mermaid` is browser-only and heavy; load it dynamically on the client (dynamic import) and render only in the preview pane to avoid SSR issues and keep initial load light.
- **Autosave write volume** → 1s debounce + flush keeps writes proportional to editing pauses, well within free-tier limits for one user.
- **`beforeunload` cannot show custom text** → Accepted; the generic prompt plus flush-on-switch is sufficient.

## Migration Plan

Greenfield app; no data migration.

- Provision a Supabase project; create `folders`/`notes` tables and RLS policies (checked-in SQL migration).
- Add `apps/notes` to the workspace and Turbo pipeline; port 3002.
- Configure env vars (Supabase URL + anon key) locally and in Vercel.
- Deploy to Vercel. Rollback = revert the change / remove the Vercel project; no shared state with other apps.

## Open Questions

- Exact Supabase Auth provider (email magic-link vs. Google OAuth) — either satisfies the single-owner requirement; default to magic-link unless the owner prefers Google.
- Whether cascade operations are implemented as Postgres functions (RPC) or multiple client calls in a transaction — decide during implementation based on `@supabase/supabase-js` ergonomics.
