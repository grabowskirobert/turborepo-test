## ADDED Requirements

### Requirement: Soft-delete notes to archive

Deleting a note SHALL archive it (soft delete) rather than removing it permanently, and archived notes SHALL NOT appear in the active folder listings.

#### Scenario: Delete a note

- **WHEN** the owner deletes an active note
- **THEN** the note is marked archived (a deletion timestamp is set) and disappears from its folder's active listing

#### Scenario: Archived note is retained

- **WHEN** a note has been archived
- **THEN** its content remains stored and viewable from the archive

### Requirement: Cascade-archive folders with confirmation

Deleting a folder SHALL archive the folder together with all of its notes, and SHALL require an explicit second confirmation before proceeding.

#### Scenario: Confirmation required

- **WHEN** the owner initiates deletion of a folder
- **THEN** the app requires an additional explicit confirmation step before any change is made

#### Scenario: Cascade on confirmed delete

- **WHEN** the owner confirms deletion of a folder
- **THEN** the folder and every note it contains are archived together

#### Scenario: Cancel confirmation

- **WHEN** the owner cancels at the confirmation step
- **THEN** the folder and its notes remain unchanged and active

### Requirement: Archive view

The app SHALL provide an archive view that lists archived notes and archived folders.

#### Scenario: View archived items

- **WHEN** the owner opens the archive view
- **THEN** the app lists archived notes and archived folders (including folders archived via cascade)

### Requirement: Restore notes from archive

The app SHALL allow restoring an archived note, returning it to active state under its original folder.

#### Scenario: Restore a note into an active folder

- **WHEN** the owner restores an archived note whose folder is currently active
- **THEN** the note becomes active again and reappears in that folder's listing

#### Scenario: Restore a note whose folder is archived

- **WHEN** the owner restores an archived note whose original folder is itself archived
- **THEN** the app also restores that folder so the note returns to a live home

### Requirement: Restore folders from archive with cascade

Restoring an archived folder SHALL restore the folder together with all of its notes that were archived as part of it, except notes that have since been permanently deleted.

#### Scenario: Restore folder brings back its notes

- **WHEN** the owner restores an archived folder
- **THEN** the folder becomes active and every one of its archived-but-not-permanently-deleted notes becomes active again

#### Scenario: Permanently deleted notes stay gone

- **WHEN** the owner restores a folder that had a note permanently deleted while archived
- **THEN** that permanently deleted note is not restored and remains gone

### Requirement: Permanent deletion from archive

The app SHALL allow permanently deleting an archived item, removing it from the backend irrecoverably. Permanently deleting a folder SHALL also permanently delete its notes so no archived note is ever left without a folder.

#### Scenario: Permanently delete a note

- **WHEN** the owner permanently deletes an archived note
- **THEN** the note is removed from the backend and can no longer be restored

#### Scenario: Permanently delete a folder cascades to its notes

- **WHEN** the owner permanently deletes an archived folder
- **THEN** the folder and all of its notes are removed from the backend irrecoverably

#### Scenario: Every archived note retains a folder

- **WHEN** any note is in the archive
- **THEN** its folder still exists (active or archived), because permanently deleting a folder also removes its notes
