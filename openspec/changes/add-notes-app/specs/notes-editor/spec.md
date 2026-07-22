## ADDED Requirements

### Requirement: Always-editable split-pane editor

The editor SHALL present an editable Markdown input and a live rendered preview side by side, both visible at all times, with no mode toggle between editing and previewing.

#### Scenario: Editing updates preview live

- **WHEN** the owner types Markdown into the editor pane
- **THEN** the preview pane re-renders to reflect the current Markdown without any manual toggle

#### Scenario: No edit/preview toggle exists

- **WHEN** the editor UI is inspected
- **THEN** there is no control that switches between an edit-only and a preview-only mode

### Requirement: Debounced autosave

The app SHALL automatically save note changes after 1 second of editing inactivity, without requiring a manual save action.

#### Scenario: Save after typing pause

- **WHEN** the owner stops typing for 1 second
- **THEN** the current note content is persisted to the backend

#### Scenario: Rapid edits coalesce

- **WHEN** the owner types continuously with pauses shorter than 1 second
- **THEN** intermediate saves are debounced into a single save issued after activity settles

### Requirement: Flush pending save on navigation

The app SHALL flush any pending (debounced-but-not-yet-written) change before the active note changes or an in-app route change occurs, so no edit is lost.

#### Scenario: Switching notes with a pending edit

- **WHEN** the owner has an unsaved debounced edit and selects a different note
- **THEN** the pending edit is written before the new note loads

#### Scenario: In-app route change with a pending edit

- **WHEN** the owner navigates to another in-app route with a pending debounced edit
- **THEN** the pending edit is flushed before the navigation completes

### Requirement: Unsaved-edit guard on page unload

The app SHALL warn the owner via the browser's `beforeunload` prompt when the tab is closed or reloaded while an edit is unsaved.

#### Scenario: Closing the tab mid-edit

- **WHEN** an edit is unsaved and the owner attempts to close or reload the tab
- **THEN** the browser shows its native "leave site / changes may not be saved" confirmation

#### Scenario: No prompt when saved

- **WHEN** there are no unsaved edits and the owner closes or reloads the tab
- **THEN** no unload confirmation is shown
