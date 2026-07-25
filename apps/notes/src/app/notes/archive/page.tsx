'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { getNotesStore } from '../../../core/store';
import type { Folder, Note } from '../../../domain/types';
import { Header } from '../../../presentation/header';
import { ConfirmModal } from '../../../presentation/confirm-modal';

const PAGE_SIZE = 20;

type PendingDelete =
  | { kind: 'note'; id: string }
  | { kind: 'folder'; id: string }
  | { kind: 'batch-notes'; ids: string[] }
  | null;

function SkeletonRow({ wide }: { wide?: boolean }) {
  return (
    <div className="flex items-center justify-between p-3 border border-zinc-700/40 rounded bg-zinc-800/40 animate-pulse">
      <div className={`h-4 ${wide ? 'w-56' : 'w-40'} bg-zinc-700/60 rounded`} />
      <div className="flex gap-3">
        <div className="h-4 w-12 bg-zinc-700/60 rounded" />
        <div className="h-4 w-24 bg-zinc-700/60 rounded" />
      </div>
    </div>
  );
}

export default function ArchivePage() {
  const store = getNotesStore();
  const [archivedNotes, setArchivedNotes] = useState<Note[]>([]);
  const [archivedFolders, setArchivedFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete>(null);
  const [notesPage, setNotesPage] = useState(0);
  const [selectedNoteIds, setSelectedNoteIds] = useState<Set<string>>(
    new Set(),
  );

  const load = useCallback(async () => {
    setLoading(true);
    const [notes, folders] = await Promise.all([
      store.getArchivedNotes(),
      store.getArchivedFolders(),
    ]);
    setArchivedNotes(notes);
    setArchivedFolders(folders);
    setNotesPage(0);
    setSelectedNoteIds(new Set());
    setLoading(false);
  }, [store]);

  useEffect(() => {
    load();
  }, [load]);

  function removeNotes(ids: string[]) {
    setArchivedNotes((prev) => {
      const next = prev.filter((n) => !ids.includes(n.id));
      const maxPage = Math.max(0, Math.ceil(next.length / PAGE_SIZE) - 1);
      setNotesPage((p) => Math.min(p, maxPage));
      return next;
    });
    setSelectedNoteIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.delete(id));
      return next;
    });
  }

  function removeFolder(id: string) {
    setArchivedFolders((prev) => prev.filter((f) => f.id !== id));
  }

  async function handleRestoreNote(id: string) {
    removeNotes([id]);
    store.restoreNote(id).catch(load);
  }

  async function handleRestoreFolder(id: string) {
    removeFolder(id);
    store.restoreFolder(id).catch(load);
  }

  async function handleConfirmDelete() {
    if (!pendingDelete) return;
    if (pendingDelete.kind === 'note') {
      const { id } = pendingDelete;
      removeNotes([id]);
      setPendingDelete(null);
      store.permanentDeleteNote(id).catch(load);
    } else if (pendingDelete.kind === 'folder') {
      const { id } = pendingDelete;
      removeFolder(id);
      setPendingDelete(null);
      store.permanentDeleteFolder(id).catch(load);
    } else if (pendingDelete.kind === 'batch-notes') {
      const { ids } = pendingDelete;
      removeNotes(ids);
      setPendingDelete(null);
      store.permanentDeleteNotes(ids).catch(load);
    }
  }

  function toggleNote(id: string) {
    setSelectedNoteIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const allSelected =
    archivedNotes.length > 0 &&
    archivedNotes.every((n) => selectedNoteIds.has(n.id));

  function toggleAll() {
    if (allSelected) {
      setSelectedNoteIds(new Set());
    } else {
      setSelectedNoteIds(new Set(archivedNotes.map((n) => n.id)));
    }
  }

  const notePageCount = Math.ceil(archivedNotes.length / PAGE_SIZE);
  const pagedNotes = archivedNotes.slice(
    notesPage * PAGE_SIZE,
    (notesPage + 1) * PAGE_SIZE,
  );

  return (
    <div className="flex flex-col h-screen bg-zinc-900">
      <Header />
      <div className="flex-1 overflow-y-auto p-6 max-w-2xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold text-zinc-100">Archive</h1>
          <Link
            href="/notes"
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            ← Back to notes
          </Link>
        </div>

        {/* Folders */}
        <section className="mb-8">
          <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-3">
            Archived Folders
          </h2>
          {loading ? (
            <div className="space-y-2">
              <SkeletonRow />
              <SkeletonRow wide />
            </div>
          ) : archivedFolders.length === 0 ? (
            <p className="text-zinc-600 text-sm">No archived folders.</p>
          ) : (
            <ul className="space-y-2">
              {archivedFolders.map((folder) => (
                <li
                  key={folder.id}
                  className="flex items-center justify-between p-3 border border-zinc-700 rounded bg-zinc-800"
                >
                  <span className="text-sm text-zinc-200">{folder.name}</span>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleRestoreFolder(folder.id)}
                      className="text-xs text-blue-400 hover:text-blue-300"
                    >
                      Restore
                    </button>
                    <button
                      onClick={() =>
                        setPendingDelete({ kind: 'folder', id: folder.id })
                      }
                      className="text-xs text-red-500 hover:text-red-400"
                    >
                      Delete permanently
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Notes */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wide flex items-center gap-2">
              Archived Notes
              {!loading && archivedNotes.length > 0 && (
                <span className="text-zinc-600 normal-case font-normal">
                  ({archivedNotes.length})
                </span>
              )}
            </h2>
            <div className="flex items-center gap-3">
              {!loading && archivedNotes.length > 0 && (
                <button
                  onClick={toggleAll}
                  className="text-xs text-zinc-400 hover:text-zinc-200"
                >
                  {allSelected ? 'Deselect all' : 'Select all'}
                </button>
              )}
              {selectedNoteIds.size > 0 && (
                <button
                  onClick={() =>
                    setPendingDelete({
                      kind: 'batch-notes',
                      ids: [...selectedNoteIds],
                    })
                  }
                  className="text-xs text-red-500 hover:text-red-400"
                >
                  Delete selected ({selectedNoteIds.size})
                </button>
              )}
              {notePageCount > 1 && (
                <span className="text-xs text-zinc-500">
                  Page {notesPage + 1} of {notePageCount}
                </span>
              )}
            </div>
          </div>

          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonRow key={i} wide={i % 2 === 0} />
              ))}
            </div>
          ) : archivedNotes.length === 0 ? (
            <p className="text-zinc-600 text-sm">No archived notes.</p>
          ) : (
            <>
              <ul className="space-y-2">
                {pagedNotes.map((note) => {
                  const checked = selectedNoteIds.has(note.id);
                  return (
                    <li
                      key={note.id}
                      className={`flex items-center gap-3 p-3 border rounded transition-colors ${
                        checked
                          ? 'border-emerald-600/40 bg-emerald-900/15'
                          : 'border-zinc-700 bg-zinc-800'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleNote(note.id)}
                        className="accent-emerald-400 shrink-0 cursor-pointer"
                      />
                      <span className="text-sm text-zinc-200 flex-1 truncate">
                        {note.title}
                      </span>
                      <div className="flex gap-3 shrink-0">
                        <button
                          onClick={() => handleRestoreNote(note.id)}
                          className="text-xs text-blue-400 hover:text-blue-300"
                        >
                          Restore
                        </button>
                        <button
                          onClick={() =>
                            setPendingDelete({ kind: 'note', id: note.id })
                          }
                          className="text-xs text-red-500 hover:text-red-400"
                        >
                          Delete permanently
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
              {notePageCount > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <button
                    onClick={() => setNotesPage((p) => Math.max(0, p - 1))}
                    disabled={notesPage === 0}
                    className="text-xs text-zinc-400 hover:text-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    ← Previous
                  </button>
                  <button
                    onClick={() =>
                      setNotesPage((p) => Math.min(notePageCount - 1, p + 1))
                    }
                    disabled={notesPage === notePageCount - 1}
                    className="text-xs text-zinc-400 hover:text-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {pendingDelete && (
        <ConfirmModal
          message={
            pendingDelete.kind === 'folder'
              ? 'Permanently delete this folder and all its notes? This cannot be undone.'
              : pendingDelete.kind === 'batch-notes'
                ? `Permanently delete ${pendingDelete.ids.length} note${pendingDelete.ids.length === 1 ? '' : 's'}? This cannot be undone.`
                : 'Permanently delete this note? This cannot be undone.'
          }
          confirmLabel="Delete permanently"
          onConfirm={handleConfirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}
