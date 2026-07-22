import type { Folder, FolderId, Note, NoteId } from '../../domain/types';

export interface NoteRepository {
  // Folder CRUD
  getFolders(): Promise<Folder[]>;
  createFolder(name: string): Promise<Folder>;
  renameFolder(id: FolderId, name: string): Promise<Folder>;

  // Note CRUD
  getNotesByFolder(folderId: FolderId): Promise<Note[]>;
  getNoteById(id: NoteId): Promise<Note | null>;
  createNote(folderId: FolderId, title: string): Promise<Note>;
  updateNoteTitle(id: NoteId, title: string): Promise<void>;
  updateNoteMarkdown(id: NoteId, markdown: string): Promise<void>;

  // Soft delete (archive)
  archiveNote(id: NoteId): Promise<void>;
  archiveFolder(id: FolderId): Promise<void>;

  // Archive queries
  getArchivedNotes(): Promise<Note[]>;
  getArchivedFolders(): Promise<Folder[]>;

  // Restore
  restoreNote(id: NoteId): Promise<void>;
  restoreFolder(id: FolderId): Promise<void>;

  // Permanent delete
  permanentDeleteNote(id: NoteId): Promise<void>;
  permanentDeleteFolder(id: FolderId): Promise<void>;
}
