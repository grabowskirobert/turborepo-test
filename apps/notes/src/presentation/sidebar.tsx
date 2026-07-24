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
  | { kind: 'archive-folder'; folder: Folder }
  | { kind: 'archive-note'; note: Note };

export function Sidebar() {
  const store = getNotesStore();
  const [state, setState] = useState<NotesState>(store.getState());
  const [modal, setModal] = useState<ModalState>({ kind: 'none' });
  const [expandedFolderIds, setExpandedFolderIds] = useState<Set<FolderId>>(
    new Set(),
  );

  useEffect(() => {
    store.loadFolders();
    return store.subscribe(setState);
  }, [store]);

  // Auto-expand the folder of the active note
  useEffect(() => {
    if (state.activeFolderId && !expandedFolderIds.has(state.activeFolderId)) {
      setExpandedFolderIds((prev) => new Set([...prev, state.activeFolderId!]));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.activeFolderId]);

  function closeModal() {
    setModal({ kind: 'none' });
  }

  function handleToggleFolder(folderId: FolderId) {
    setExpandedFolderIds((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
        if (!state.notesByFolder[folderId]) {
          store.loadNotes(folderId);
        }
      }
      return next;
    });
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
            className="text-zinc-400 hover:text-zinc-100 text-xl leading-none w-6 h-6 flex items-center justify-center rounded hover:bg-zinc-700 transition-colors"
            title="New folder"
          >
            +
          </button>
        </div>
        <ul className="flex-1">
          {state.folders.map((folder) => {
            const isExpanded = expandedFolderIds.has(folder.id);
            const hasActiveNote = state.activeFolderId === folder.id;
            return (
              <li key={folder.id}>
                <div
                  className={`flex items-center justify-between px-3 py-2 cursor-pointer select-none group ${
                    hasActiveNote ? 'bg-zinc-800' : 'hover:bg-zinc-800/60'
                  }`}
                  onClick={() => handleToggleFolder(folder.id)}
                >
                  <span className="flex items-center gap-1.5 flex-1 min-w-0">
                    <span className="text-zinc-500 text-xs w-3 shrink-0">
                      {isExpanded ? '▾' : '▸'}
                    </span>
                    <span
                      className={`text-base font-semibold truncate ${hasActiveNote ? 'text-zinc-100' : 'text-zinc-200'}`}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        setModal({ kind: 'rename-folder', folder });
                      }}
                    >
                      {folder.name}
                    </span>
                  </span>
                  <span className="flex opacity-0 group-hover:opacity-100 items-center gap-0.5 shrink-0 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setModal({ kind: 'new-note', folderId: folder.id });
                      }}
                      className="text-zinc-400 hover:text-zinc-100 text-base w-6 h-6 flex items-center justify-center rounded hover:bg-zinc-700 transition-colors"
                      title="New note"
                    >
                      +
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setModal({ kind: 'archive-folder', folder });
                      }}
                      className="text-zinc-500 hover:text-red-400 text-xs w-6 h-6 flex items-center justify-center rounded hover:bg-zinc-800 transition-colors"
                      title="Archive folder"
                    >
                      ✕
                    </button>
                  </span>
                </div>
                {isExpanded && (
                  <ul>
                    {(state.notesByFolder[folder.id] ?? []).map((note) => (
                      <li
                        key={note.id}
                        className={`flex items-center justify-between pl-8 pr-2 py-1.5 cursor-pointer group ${
                          state.activeNoteId === note.id
                            ? 'bg-zinc-700'
                            : 'hover:bg-zinc-800'
                        }`}
                        onClick={() => store.selectNote(note.id)}
                        onMouseEnter={() => store.prefetchNote(note.id)}
                      >
                        <span className="text-sm text-zinc-300 truncate flex-1">
                          {note.title}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setModal({ kind: 'archive-note', note });
                          }}
                          className="flex opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-400 text-xs w-5 h-5 items-center justify-center rounded transition-opacity shrink-0"
                          title="Archive note"
                        >
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
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

      {modal.kind === 'archive-note' && (
        <ConfirmModal
          message={`Archive note "${modal.note.title}"?`}
          confirmLabel="Archive"
          onConfirm={async () => {
            const note = modal.note;
            closeModal();
            await store.archiveNote(note.id);
          }}
          onCancel={closeModal}
        />
      )}
    </>
  );
}
