## ADDED Requirements

### Requirement: One-level folder structure

The app SHALL support folders that hold notes, and folders SHALL NOT be nestable inside other folders.

#### Scenario: Create a folder

- **WHEN** the owner creates a folder with a name
- **THEN** the folder is persisted and appears in the sidebar

#### Scenario: Folders cannot nest

- **WHEN** the data model or UI is inspected for folder relationships
- **THEN** a folder has no parent-folder reference and there is no way to place a folder inside another folder

#### Scenario: Rename a folder

- **WHEN** the owner renames a folder
- **THEN** the new name is persisted and reflected in the sidebar

### Requirement: Notes belong to a folder

Each note SHALL reference exactly one folder and SHALL hold a title and Markdown body.

#### Scenario: Create a note in a folder

- **WHEN** the owner creates a note within a selected folder
- **THEN** a new note is persisted with that folder reference, an editable title, and an empty Markdown body

#### Scenario: List notes within a folder

- **WHEN** the owner expands or selects a folder
- **THEN** the app lists the active (non-archived) notes belonging to that folder

#### Scenario: Rename a note title

- **WHEN** the owner edits a note's title
- **THEN** the updated title is persisted and shown in the sidebar

### Requirement: Sidebar navigation

The app SHALL present folders and their notes in a sidebar and SHALL let the owner select a note to open it in the editor.

#### Scenario: Select a note

- **WHEN** the owner clicks a note in the sidebar
- **THEN** the note's title and Markdown load into the editor and preview
