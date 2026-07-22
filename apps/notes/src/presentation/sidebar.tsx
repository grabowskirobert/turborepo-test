'use client';
import { useEffect, useState } from 'react';
import { getNotesStore } from '../core/store';
import type { NotesState } from '../core/store/notes-store';
import type { Folder, FolderId, Note } from '../domain/types';

export function Sidebar() {
  const store = getNotesStore();
  const [state, setState] = useState<NotesState>(store.getState());

  useEffect(() => {
    store.loadFolders();
    return store.subscribe(setState);
  }, [store]);

  async function handleNewFolder() {
    const name = window.prompt('Folder name');
    if (!name?.trim()) return;
    await store.createFolder(name.trim());
  }

  async function handleRenameFolder(folder: Folder) {
    const name = window.prompt('New folder name', folder.name);
    if (!name?.trim() || name === folder.name) return;
    await store.renameFolder(folder.id, name.trim());
  }

  async function handleSelectFolder(folderId: FolderId) {
    if (state.activeFolderId === folderId) return;
    setState((s) => ({ ...s, activeFolderId: folderId }));
    await store.loadNotes(folderId);
  }

  async function handleNewNote(folderId: FolderId) {
    const title = window.prompt('Note title', 'Untitled');
    if (!title?.trim()) return;
    const note = await store.createNote(folderId, title.trim());
    await store.selectNote(note.id);
  }

  async function handleArchiveFolder(folder: Folder) {
    const ok = window.confirm(
      `Archive folder "${folder.name}" and all its notes?`,
    );
    if (!ok) return;
    const really = window.confirm(
      'Are you sure? This will archive all notes in the folder.',
    );
    if (!really) return;
    await store.archiveFolder(folder.id);
  }

  async function handleArchiveNote(note: Note) {
    await store.archiveNote(note.id);
  }

  return (
    <aside className="w-64 border-r border-gray-200 flex flex-col h-full overflow-y-auto">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">
          Folders
        </span>
        <button
          onClick={handleNewFolder}
          className="text-gray-400 hover:text-gray-700 text-lg leading-none"
          title="New folder"
        >
          +
        </button>
      </div>
      <ul className="flex-1">
        {state.folders.map((folder) => (
          <li key={folder.id}>
            <div
              className={`flex items-center justify-between px-4 py-2 cursor-pointer select-none group ${
                state.activeFolderId === folder.id
                  ? 'bg-blue-50'
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => handleSelectFolder(folder.id)}
            >
              <span
                className="text-sm truncate flex-1"
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  handleRenameFolder(folder);
                }}
              >
                {folder.name}
              </span>
              <span className="hidden group-hover:flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNewNote(folder.id);
                  }}
                  className="text-gray-400 hover:text-gray-700 text-xs px-1"
                  title="New note"
                >
                  +
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleArchiveFolder(folder);
                  }}
                  className="text-gray-400 hover:text-red-500 text-xs px-1"
                  title="Archive folder"
                >
                  ✕
                </button>
              </span>
            </div>
            {state.activeFolderId === folder.id && (
              <ul>
                {(state.notesByFolder[folder.id] ?? []).map((note) => (
                  <li
                    key={note.id}
                    className={`flex items-center justify-between pl-8 pr-4 py-1.5 cursor-pointer group ${
                      state.activeNoteId === note.id
                        ? 'bg-blue-100'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => store.selectNote(note.id)}
                  >
                    <span className="text-sm truncate flex-1">
                      {note.title}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleArchiveNote(note);
                      }}
                      className="hidden group-hover:block text-gray-400 hover:text-red-500 text-xs"
                      title="Archive note"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </aside>
  );
}
