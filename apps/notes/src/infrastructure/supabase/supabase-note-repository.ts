import type { SupabaseClient } from '@supabase/supabase-js';
import type { Folder, FolderId, Note, NoteId } from '../../domain/types';
import type { NoteRepository } from '../../core/ports/note-repository';

function toFolder(row: Record<string, unknown>): Folder {
  return {
    id: row.id as string,
    ownerId: row.owner_id as string,
    name: row.name as string,
    createdAt: new Date(row.created_at as string),
    deletedAt: row.deleted_at ? new Date(row.deleted_at as string) : null,
  };
}

function toNote(row: Record<string, unknown>): Note {
  return {
    id: row.id as string,
    ownerId: row.owner_id as string,
    folderId: row.folder_id as string,
    title: row.title as string,
    markdown: row.markdown as string,
    updatedAt: new Date(row.updated_at as string),
    deletedAt: row.deleted_at ? new Date(row.deleted_at as string) : null,
  };
}

export class SupabaseNoteRepository implements NoteRepository {
  constructor(private supabase: SupabaseClient) {}

  private async getUserId(): Promise<string> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    return user.id;
  }

  async getFolders(): Promise<Folder[]> {
    const { data, error } = await this.supabase
      .from('folders')
      .select('*')
      .is('deleted_at', null)
      .order('created_at');
    if (error) throw error;
    return (data ?? []).map(toFolder);
  }

  async createFolder(name: string): Promise<Folder> {
    const ownerId = await this.getUserId();
    const { data, error } = await this.supabase
      .from('folders')
      .insert({ name, owner_id: ownerId })
      .select()
      .single();
    if (error) throw error;
    return toFolder(data);
  }

  async renameFolder(id: FolderId, name: string): Promise<Folder> {
    const { data, error } = await this.supabase
      .from('folders')
      .update({ name })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return toFolder(data);
  }

  async getNotesByFolder(folderId: FolderId): Promise<Note[]> {
    const { data, error } = await this.supabase
      .from('notes')
      .select('*')
      .eq('folder_id', folderId)
      .is('deleted_at', null)
      .order('updated_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(toNote);
  }

  async getNoteById(id: NoteId): Promise<Note | null> {
    const { data, error } = await this.supabase
      .from('notes')
      .select('*')
      .eq('id', id)
      .single();
    if (error) return null;
    return toNote(data);
  }

  async createNote(folderId: FolderId, title: string): Promise<Note> {
    const ownerId = await this.getUserId();
    const { data, error } = await this.supabase
      .from('notes')
      .insert({ folder_id: folderId, title, owner_id: ownerId })
      .select()
      .single();
    if (error) throw error;
    return toNote(data);
  }

  async updateNoteTitle(id: NoteId, title: string): Promise<void> {
    const { error } = await this.supabase
      .from('notes')
      .update({ title, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
  }

  async updateNoteMarkdown(id: NoteId, markdown: string): Promise<void> {
    const { error } = await this.supabase
      .from('notes')
      .update({ markdown, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
  }

  async archiveNote(id: NoteId): Promise<void> {
    const { error } = await this.supabase
      .from('notes')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
  }

  async archiveFolder(id: FolderId): Promise<void> {
    const now = new Date().toISOString();
    const { error: notesError } = await this.supabase
      .from('notes')
      .update({ deleted_at: now })
      .eq('folder_id', id)
      .is('deleted_at', null);
    if (notesError) throw notesError;
    const { error: folderError } = await this.supabase
      .from('folders')
      .update({ deleted_at: now })
      .eq('id', id);
    if (folderError) throw folderError;
  }

  async getArchivedNotes(): Promise<Note[]> {
    const { data, error } = await this.supabase
      .from('notes')
      .select('*')
      .not('deleted_at', 'is', null)
      .order('deleted_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(toNote);
  }

  async getArchivedFolders(): Promise<Folder[]> {
    const { data, error } = await this.supabase
      .from('folders')
      .select('*')
      .not('deleted_at', 'is', null)
      .order('deleted_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(toFolder);
  }

  async restoreNote(id: NoteId): Promise<void> {
    const note = await this.getNoteById(id);
    if (!note) return;

    // If folder is archived, restore it first
    const { data: folder } = await this.supabase
      .from('folders')
      .select('*')
      .eq('id', note.folderId)
      .single();
    if (folder?.deleted_at) {
      await this.restoreFolder(note.folderId);
    }

    const { error } = await this.supabase
      .from('notes')
      .update({ deleted_at: null })
      .eq('id', id);
    if (error) throw error;
  }

  async restoreFolder(id: FolderId): Promise<void> {
    const { error: folderError } = await this.supabase
      .from('folders')
      .update({ deleted_at: null })
      .eq('id', id);
    if (folderError) throw folderError;

    // Restore notes that are archived but NOT permanently deleted (deleted_at is set but row still exists)
    // Permanently deleted notes are gone from the DB entirely
    const { error: notesError } = await this.supabase
      .from('notes')
      .update({ deleted_at: null })
      .eq('folder_id', id)
      .not('deleted_at', 'is', null);
    if (notesError) throw notesError;
  }

  async permanentDeleteNote(id: NoteId): Promise<void> {
    const { error } = await this.supabase.from('notes').delete().eq('id', id);
    if (error) throw error;
  }

  async permanentDeleteFolder(id: FolderId): Promise<void> {
    // ON DELETE CASCADE handles notes; just delete the folder
    const { error } = await this.supabase.from('folders').delete().eq('id', id);
    if (error) throw error;
  }
}
