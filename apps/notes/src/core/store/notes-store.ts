import type { Folder, FolderId, Note, NoteId } from '../../domain/types';
import type { NoteRepository } from '../ports/note-repository';

export interface NotesState {
  folders: Folder[];
  notesByFolder: Record<FolderId, Note[]>;
  activeFolderId: FolderId | null;
  activeNoteId: NoteId | null;
  activeNoteContent: { title: string; markdown: string } | null;
  dirty: boolean;
  loading: boolean;
}

type Listener = (state: NotesState) => void;

function makeInitialState(): NotesState {
  return {
    folders: [],
    notesByFolder: {},
    activeFolderId: null,
    activeNoteId: null,
    activeNoteContent: null,
    dirty: false,
    loading: false,
  };
}

export class NotesStore {
  private state: NotesState = makeInitialState();
  private listeners = new Set<Listener>();
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private repo: NoteRepository) {}

  getState(): NotesState {
    return this.state;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private setState(patch: Partial<NotesState>): void {
    this.state = { ...this.state, ...patch };
    this.listeners.forEach((l) => l(this.state));
  }

  async loadFolders(): Promise<void> {
    this.setState({ loading: true });
    const folders = await this.repo.getFolders();
    this.setState({ folders, loading: false });
  }

  async loadNotes(folderId: FolderId): Promise<void> {
    const notes = await this.repo.getNotesByFolder(folderId);
    this.setState({
      notesByFolder: { ...this.state.notesByFolder, [folderId]: notes },
    });
  }

  async selectFolder(folderId: FolderId): Promise<void> {
    this.setState({ activeFolderId: folderId });
    await this.loadNotes(folderId);
  }

  async selectNote(noteId: NoteId): Promise<void> {
    await this.flushPendingSave();
    const note = await this.repo.getNoteById(noteId);
    if (!note) return;
    this.setState({
      activeNoteId: noteId,
      activeFolderId: note.folderId,
      activeNoteContent: { title: note.title, markdown: note.markdown },
      dirty: false,
    });
  }

  editMarkdown(markdown: string): void {
    this.setState({
      activeNoteContent: this.state.activeNoteContent
        ? { ...this.state.activeNoteContent, markdown }
        : null,
      dirty: true,
    });
    this.scheduleSave();
  }

  async editTitle(title: string): Promise<void> {
    if (!this.state.activeNoteId) return;
    this.setState({
      activeNoteContent: this.state.activeNoteContent
        ? { ...this.state.activeNoteContent, title }
        : null,
    });
    await this.repo.updateNoteTitle(this.state.activeNoteId, title);
    if (this.state.activeFolderId) {
      await this.loadNotes(this.state.activeFolderId);
    }
  }

  private scheduleSave(): void {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => this.persistCurrentNote(), 1000);
  }

  async flushPendingSave(): Promise<void> {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    await this.persistCurrentNote();
  }

  private async persistCurrentNote(): Promise<void> {
    const { activeNoteId, activeNoteContent, dirty } = this.state;
    if (!activeNoteId || !activeNoteContent || !dirty) return;
    await this.repo.updateNoteMarkdown(
      activeNoteId,
      activeNoteContent.markdown,
    );
    this.setState({ dirty: false });
  }

  async createFolder(name: string): Promise<void> {
    const folder = await this.repo.createFolder(name);
    this.setState({ folders: [...this.state.folders, folder] });
  }

  async renameFolder(id: FolderId, name: string): Promise<void> {
    await this.repo.renameFolder(id, name);
    this.setState({
      folders: this.state.folders.map((f) =>
        f.id === id ? { ...f, name } : f,
      ),
    });
  }

  async createNote(folderId: FolderId, title: string): Promise<Note> {
    const note = await this.repo.createNote(folderId, title);
    const existing = this.state.notesByFolder[folderId] ?? [];
    this.setState({
      notesByFolder: {
        ...this.state.notesByFolder,
        [folderId]: [...existing, note],
      },
    });
    return note;
  }

  async archiveNote(id: NoteId): Promise<void> {
    await this.repo.archiveNote(id);
    if (this.state.activeFolderId) {
      await this.loadNotes(this.state.activeFolderId);
    }
    if (this.state.activeNoteId === id) {
      this.setState({
        activeNoteId: null,
        activeNoteContent: null,
        dirty: false,
      });
    }
  }

  async archiveFolder(id: FolderId): Promise<void> {
    await this.repo.archiveFolder(id);
    await this.loadFolders();
    if (this.state.activeFolderId === id) {
      this.setState({
        activeFolderId: null,
        activeNoteId: null,
        activeNoteContent: null,
        dirty: false,
      });
    }
  }

  async restoreNote(id: NoteId): Promise<void> {
    await this.repo.restoreNote(id);
  }

  async restoreFolder(id: FolderId): Promise<void> {
    await this.repo.restoreFolder(id);
    await this.loadFolders();
  }

  async permanentDeleteNote(id: NoteId): Promise<void> {
    await this.repo.permanentDeleteNote(id);
  }

  async permanentDeleteFolder(id: FolderId): Promise<void> {
    await this.repo.permanentDeleteFolder(id);
    await this.loadFolders();
  }

  getArchivedNotes(): Promise<Note[]> {
    return this.repo.getArchivedNotes();
  }

  getArchivedFolders(): Promise<Folder[]> {
    return this.repo.getArchivedFolders();
  }
}
