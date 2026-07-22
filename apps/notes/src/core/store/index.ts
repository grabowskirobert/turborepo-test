import { createBrowserClient } from '../../infrastructure/supabase/supabase-client';
import { SupabaseNoteRepository } from '../../infrastructure/supabase/supabase-note-repository';
import { NotesStore } from './notes-store';

let store: NotesStore | null = null;

export function getNotesStore(): NotesStore {
  if (!store) {
    const supabase = createBrowserClient();
    const repo = new SupabaseNoteRepository(supabase);
    store = new NotesStore(repo);
  }
  return store;
}
