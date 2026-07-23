'use client';
import { useEffect, useState } from 'react';
import { getNotesStore } from '../core/store';
import type { NotesState } from '../core/store/notes-store';
import type { Folder, FolderId, Note } from '../domain/types';
import { InputModal } from './input-modal';
import { ConfirmModal } from './confirm-modal';

type ModalState =
  | { kind: 'none' }
  | { kind: 'new-folder' }
  | { kind: 'rename-folder'; folder: Folder }
  | { kind: 'new-note'; folderId: FolderId }
  | { kind: 'archive-folder'; folder: Folder };

export function Sidebar() {
  const store = getNotesStore();
  const [state, setState] = useState<NotesState>(store.getState());
  const [modal, setModal] = useState<ModalState>({ kind: 'none' });

  useEffect(() => {
    store.loadFolders();
    return store.subscribe(setState);
  }, [store]);

  function closeModal() {
    setModal({ kind: 'none' });
  }

  async function handleSelectFolder(folderId: FolderId) {
    if (state.activeFolderId === folderId) return;
    await store.selectFolder(folderId);
  }

  async function handleArchiveNote(note: Note) {
    await store.archiveNote(note.id);
  }

  return (
    <>
      <aside className="w-64 border-r border-zinc-700 flex flex-col h-full overflow-y-auto bg-zinc-900">
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-700">
          <span className="text-xs font-medium text-zinc-400 uppercase tracking-wide">
            Folders
          </span>
          <button
            onClick={() => setModal({ kind: 'new-folder' })}
            className="text-zinc-500 hover:text-zinc-200 text-lg leading-none"
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
                    ? 'bg-zinc-700'
                    : 'hover:bg-zinc-800'
                }`}
                onClick={() => handleSelectFolder(folder.id)}
              >
                <span
                  className="text-sm text-zinc-200 truncate flex-1"
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    setModal({ kind: 'rename-folder', folder });
                  }}
                >
                  {folder.name}
                </span>
                <span className="hidden group-hover:flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setModal({ kind: 'new-note', folderId: folder.id });
                    }}
                    className="text-zinc-500 hover:text-zinc-200 text-xs px-1"
                    title="New note"
                  >
                    +
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setModal({ kind: 'archive-folder', folder });
                    }}
                    className="text-zinc-500 hover:text-red-400 text-xs px-1"
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
                          ? 'bg-zinc-600'
                          : 'hover:bg-zinc-800'
                      }`}
                      onClick={() => store.selectNote(note.id)}
                    >
                      <span className="text-sm text-zinc-300 truncate flex-1">
                        {note.title}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleArchiveNote(note);
                        }}
                        className="hidden group-hover:block text-zinc-500 hover:text-red-400 text-xs"
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

      {modal.kind === 'new-folder' && (
        <InputModal
          title="New folder"
          placeholder="Folder name"
          onConfirm={async (name) => {
            closeModal();
            await store.createFolder(name);
          }}
          onCancel={closeModal}
        />
      )}

      {modal.kind === 'rename-folder' && (
        <InputModal
          title="Rename folder"
          defaultValue={modal.folder.name}
          onConfirm={async (name) => {
            closeModal();
            if (name !== modal.folder.name)
              await store.renameFolder(modal.folder.id, name);
          }}
          onCancel={closeModal}
        />
      )}

      {modal.kind === 'new-note' && (
        <InputModal
          title="New note"
          placeholder="Note title"
          defaultValue="Untitled"
          onConfirm={async (title) => {
            const folderId = modal.folderId;
            closeModal();
            const note = await store.createNote(folderId, title);
            await store.selectNote(note.id);
          }}
          onCancel={closeModal}
        />
      )}

      {modal.kind === 'archive-folder' && (
        <ConfirmModal
          message={`Archive folder "${modal.folder.name}" and all its notes?`}
          confirmLabel="Archive"
          onConfirm={async () => {
            const folder = modal.folder;
            closeModal();
            await store.archiveFolder(folder.id);
          }}
          onCancel={closeModal}
        />
      )}
    </>
  );
}
