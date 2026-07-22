export type FolderId = string;
export type NoteId = string;

export interface Folder {
  id: FolderId;
  ownerId: string;
  name: string;
  createdAt: Date;
  deletedAt: Date | null;
}

export interface Note {
  id: NoteId;
  ownerId: string;
  folderId: FolderId;
  title: string;
  markdown: string;
  updatedAt: Date;
  deletedAt: Date | null;
}
