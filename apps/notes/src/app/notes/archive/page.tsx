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
  | null;

export default function ArchivePage() {
  const store = getNotesStore();
  const [archivedNotes, setArchivedNotes] = useState<Note[]>([]);
  const [archivedFolders, setArchivedFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete>(null);
  const [notesPage, setNotesPage] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    const [notes, folders] = await Promise.all([
      store.getArchivedNotes(),
      store.getArchivedFolders(),
    ]);
    setArchivedNotes(notes);
    setArchivedFolders(folders);
    setNotesPage(0);
    setLoading(false);
  }, [store]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleRestoreNote(id: string) {
    await store.restoreNote(id);
    await load();
  }

  async function handleRestoreFolder(id: string) {
    await store.restoreFolder(id);
    await load();
  }

  async function handleConfirmDelete() {
    if (!pendingDelete) return;
    if (pendingDelete.kind === 'note') {
      await store.permanentDeleteNote(pendingDelete.id);
    } else {
      await store.permanentDeleteFolder(pendingDelete.id);
    }
    setPendingDelete(null);
    await load();
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
        {loading && <p className="text-zinc-500">Loading...</p>}
        {!loading && (
          <>
            <section className="mb-8">
              <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-3">
                Archived Folders
              </h2>
              {archivedFolders.length === 0 && (
                <p className="text-zinc-600 text-sm">No archived folders.</p>
              )}
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
            </section>

            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
                  Archived Notes
                  {archivedNotes.length > 0 && (
                    <span className="ml-2 text-zinc-600 normal-case">
                      ({archivedNotes.length})
                    </span>
                  )}
                </h2>
                {notePageCount > 1 && (
                  <span className="text-xs text-zinc-500">
                    Page {notesPage + 1} of {notePageCount}
                  </span>
                )}
              </div>
              {archivedNotes.length === 0 && (
                <p className="text-zinc-600 text-sm">No archived notes.</p>
              )}
              <ul className="space-y-2">
                {pagedNotes.map((note) => (
                  <li
                    key={note.id}
                    className="flex items-center justify-between p-3 border border-zinc-700 rounded bg-zinc-800"
                  >
                    <span className="text-sm text-zinc-200">{note.title}</span>
                    <div className="flex gap-3">
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
                ))}
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
            </section>
          </>
        )}
      </div>

      {pendingDelete && (
        <ConfirmModal
          message={
            pendingDelete.kind === 'folder'
              ? 'Permanently delete this folder and all its notes? This cannot be undone.'
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
