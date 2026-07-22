import { describe, it, expect, vi } from 'vitest';
import type { NoteRepository } from '../ports/note-repository';
import { cascadeArchiveFolder } from './cascade-archive-folder';
import { restoreFolder } from './restore-folder';
import { permanentDeleteFolder } from './permanent-delete-folder';

function makeRepo(overrides: Partial<NoteRepository> = {}): NoteRepository {
  return {
    getFolders: vi.fn(),
    createFolder: vi.fn(),
    renameFolder: vi.fn(),
    getNotesByFolder: vi.fn(),
    getNoteById: vi.fn(),
    createNote: vi.fn(),
    updateNoteTitle: vi.fn(),
    updateNoteMarkdown: vi.fn(),
    archiveNote: vi.fn(),
    archiveFolder: vi.fn(),
    getArchivedNotes: vi.fn(),
    getArchivedFolders: vi.fn(),
    restoreNote: vi.fn(),
    restoreFolder: vi.fn(),
    permanentDeleteNote: vi.fn(),
    permanentDeleteFolder: vi.fn(),
    ...overrides,
  };
}

describe('cascadeArchiveFolder', () => {
  it('archives the folder via the repository', async () => {
    const repo = makeRepo();
    await cascadeArchiveFolder(repo, 'folder-1');
    expect(repo.archiveFolder).toHaveBeenCalledWith('folder-1');
  });
});

describe('restoreFolder', () => {
  it('restores the folder via the repository', async () => {
    const repo = makeRepo();
    await restoreFolder(repo, 'folder-1');
    expect(repo.restoreFolder).toHaveBeenCalledWith('folder-1');
  });
});

describe('permanentDeleteFolder', () => {
  it('permanently deletes the folder via the repository', async () => {
    const repo = makeRepo();
    await permanentDeleteFolder(repo, 'folder-1');
    expect(repo.permanentDeleteFolder).toHaveBeenCalledWith('folder-1');
  });
});

describe('archive/restore invariants', () => {
  it('every archived note retains a folder — permanentDeleteFolder also removes its notes (via ON DELETE CASCADE)', async () => {
    // The invariant: permanently deleting a folder removes all its notes at DB level (FK ON DELETE CASCADE).
    // The repo.permanentDeleteFolder is the single call; the DB cascade handles note deletion.
    // Here we verify the use-case delegates to the correct repo method — not two separate deletes.
    const repo = makeRepo();
    await permanentDeleteFolder(repo, 'folder-1');
    expect(repo.permanentDeleteFolder).toHaveBeenCalledWith('folder-1');
    expect(repo.permanentDeleteNote).not.toHaveBeenCalled();
  });

  it('cascade-archive archives notes and folder in one repo call', async () => {
    // archiveFolder in the repository handles both folder + notes atomically
    const repo = makeRepo();
    await cascadeArchiveFolder(repo, 'folder-1');
    expect(repo.archiveFolder).toHaveBeenCalledTimes(1);
    expect(repo.archiveNote).not.toHaveBeenCalled();
  });

  it('restoreFolder does not restore permanently-deleted notes (they no longer exist in DB)', async () => {
    // Permanently deleted notes are removed from DB; restoreFolder only un-archives rows
    // that still exist. The repo handles this correctly — there's nothing to restore for deleted rows.
    // We verify restoreFolder is called (not permanentDeleteNote or other side-effects).
    const repo = makeRepo();
    await restoreFolder(repo, 'folder-1');
    expect(repo.restoreFolder).toHaveBeenCalledWith('folder-1');
    expect(repo.permanentDeleteNote).not.toHaveBeenCalled();
  });
});
