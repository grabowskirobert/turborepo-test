'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getNotesStore } from '../../../core/store';
import type { Folder, Note } from '../../../domain/types';
import { Header } from '../../../presentation/header';

export default function ArchivePage() {
  const store = getNotesStore();
  const [archivedNotes, setArchivedNotes] = useState<Note[]>([]);
  const [archivedFolders, setArchivedFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const [notes, folders] = await Promise.all([
      store.getArchivedNotes(),
      store.getArchivedFolders(),
    ]);
    setArchivedNotes(notes);
    setArchivedFolders(folders);
    setLoading(false);
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    load();
  }, []);

  async function handleRestoreNote(id: string) {
    await store.restoreNote(id);
    await load();
  }

  async function handleRestoreFolder(id: string) {
    await store.restoreFolder(id);
    await load();
  }

  async function handlePermanentDeleteNote(id: string) {
    if (!window.confirm('Permanently delete this note? This cannot be undone.'))
      return;
    await store.permanentDeleteNote(id);
    await load();
  }

  async function handlePermanentDeleteFolder(id: string) {
    if (
      !window.confirm(
        'Permanently delete this folder and all its notes? This cannot be undone.',
      )
    )
      return;
    await store.permanentDeleteFolder(id);
    await load();
  }

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex-1 overflow-y-auto p-6 max-w-2xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold">Archive</h1>
          <Link href="/notes" className="text-sm text-blue-600 hover:underline">
            ← Back to notes
          </Link>
        </div>
        {loading && <p className="text-gray-400">Loading...</p>}
        {!loading && (
          <>
            <section className="mb-8">
              <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
                Archived Folders
              </h2>
              {archivedFolders.length === 0 && (
                <p className="text-gray-400 text-sm">No archived folders.</p>
              )}
              <ul className="space-y-2">
                {archivedFolders.map((folder) => (
                  <li
                    key={folder.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded"
                  >
                    <span className="text-sm">{folder.name}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRestoreFolder(folder.id)}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Restore
                      </button>
                      <button
                        onClick={() => handlePermanentDeleteFolder(folder.id)}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Delete permanently
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
            <section>
              <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
                Archived Notes
              </h2>
              {archivedNotes.length === 0 && (
                <p className="text-gray-400 text-sm">No archived notes.</p>
              )}
              <ul className="space-y-2">
                {archivedNotes.map((note) => (
                  <li
                    key={note.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded"
                  >
                    <span className="text-sm">{note.title}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRestoreNote(note.id)}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Restore
                      </button>
                      <button
                        onClick={() => handlePermanentDeleteNote(note.id)}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Delete permanently
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
