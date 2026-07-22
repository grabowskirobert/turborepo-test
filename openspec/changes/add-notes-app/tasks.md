## 1. App scaffold & workspace wiring

- [x] 1.1 Create `apps/notes` Next.js 16 app (App Router, React 19) on port 3002, mirroring `apps/web` config (`package.json` scripts: dev/build/start/lint/check-types)
- [x] 1.2 Wire shared configs: extend `@repo/eslint-config`, `@repo/typescript-config`, `@repo/tailwind-config`; add `@repo/ui`; enforce kebab-case filenames
- [x] 1.3 Confirm Turbo picks up the app (`pnpm build`, `pnpm dev`, `pnpm lint`, `pnpm check-types` all include `notes`)
- [x] 1.4 Create the layered folder skeleton under `apps/notes/src/`: `domain/`, `core/{ports,use-cases,store}/`, `infrastructure/supabase/`, `integration/`, `presentation/`; keep `app/` thin (routing only)

## 2. Dependencies & Supabase project

- [x] 2.1 Add deps: `@supabase/supabase-js`, `@supabase/ssr`, `react-markdown`, `remark-gfm`, `mermaid` (reuse existing `shiki`)
- [x] 2.2 Provision a Supabase project; add env vars (`NEXT_PUBLIC_SUPABASE_URL`, anon key) with a local `.env.example`
- [x] 2.3 Author a checked-in SQL migration: `folders` and `notes` tables (columns per design), `owner_id`, `deleted_at`, `notes.folder_id` FK `ON DELETE CASCADE`
- [x] 2.4 Add RLS policies restricting every read/write on both tables to `auth.uid() = owner_id`

## 3. Domain & core ports

- [x] 3.1 Define `domain/` types only: `Folder`, `Note`, id types
- [x] 3.2 Define `core/ports/note-repository.ts` — interface for folder/note CRUD, archive, restore, permanent-delete
- [x] 3.3 Implement `core/store/` state management + composition root that injects a `NoteRepository` implementation

## 4. Supabase repository (infrastructure)

- [x] 4.1 Implement `infrastructure/supabase/supabase-client.ts` (browser + server clients via `@supabase/ssr`)
- [x] 4.2 Implement `infrastructure/supabase/supabase-note-repository.ts` satisfying the `NoteRepository` port; active queries filter `deleted_at IS NULL`
- [x] 4.3 Implement cascade operations as transactions/RPC: cascade-archive folder, restore folder (skip permanently-deleted notes), permanent-delete folder (cascade to notes)

## 5. Authentication (notes-authentication)

- [x] 5.1 Build the sign-in route/page using Supabase Auth
- [x] 5.2 Add middleware/server session check redirecting unauthenticated visitors to sign-in; guard all note routes
- [x] 5.3 Add sign-out; persist session across reloads
- [x] 5.4 Verify RLS: a non-owner session returns no rows

## 6. Organization: folders & notes CRUD (notes-organization)

- [x] 6.1 Sidebar `presentation` component listing folders and their active notes
- [x] 6.2 Folder create/rename (no nesting — no parent reference anywhere)
- [x] 6.3 Note create within a folder, title rename
- [x] 6.4 Select a note → load its title + Markdown into the editor

## 7. Editor & autosave (notes-editor)

- [x] 7.1 Always-visible split-pane layout (edit ǀ live preview), no mode toggle
- [x] 7.2 1s debounced autosave writing through the store → repository
- [x] 7.3 Flush pending save on note-switch and in-app route change
- [x] 7.4 `dirty` flag + `beforeunload` guard in `integration/` firing only while unsaved

## 8. Markdown rendering (notes-markdown-rendering)

- [x] 8.1 `react-markdown` + `remark-gfm` preview, memoized on the Markdown string
- [x] 8.2 Custom code renderer: non-`mermaid` fences → `shiki` highlighting (plain fence without language still renders)
- [x] 8.3 `mermaid` fences → diagram via dynamically-imported `mermaid`; invalid syntax shows inline error without crashing the preview
- [x] 8.4 Confirm no image upload/embedding affordance exists (out of scope)

## 9. Archive & restore (notes-archive)

- [x] 9.1 Delete note → soft delete (set `deleted_at`), remove from active listing
- [x] 9.2 Delete folder → cascade-archive with required second confirmation (cancel = no-op)
- [x] 9.3 Archive view listing archived notes and archived folders
- [x] 9.4 Restore note (restore its folder too if that folder is archived)
- [x] 9.5 Restore folder → cascade-restore its notes, skipping permanently-deleted ones
- [x] 9.6 Permanent delete note; permanent delete folder cascades to its notes

## 10. Tests, quality gate & deploy

- [x] 10.1 Unit-test `core` use-cases for cascade/restore/permanent-delete invariants (esp. "every archived note keeps a folder")
- [x] 10.2 Pass the quality gate: `pnpm ci:is-working` (check-types + lint 0-warnings + build)
- [ ] 10.3 Deploy to Vercel with Supabase env vars; verify sign-in, autosave, mermaid, and archive/restore end-to-end
