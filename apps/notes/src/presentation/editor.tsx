'use client';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { getNotesStore } from '../core/store';
import type { NotesState } from '../core/store/notes-store';
import { useUnloadGuard } from '../integration/use-unload-guard';
import { MarkdownPreview } from './markdown-preview';

export function Editor() {
  const store = getNotesStore();
  const [state, setState] = useState<NotesState>(store.getState());
  const pathname = usePathname();
  const prevPathRef = useRef(pathname);

  useEffect(() => store.subscribe(setState), [store]);

  useEffect(() => {
    if (prevPathRef.current !== pathname) {
      prevPathRef.current = pathname;
      store.flushPendingSave();
    }
  }, [pathname, store]);

  useUnloadGuard(state.dirty);

  if (!state.activeNoteContent) {
    return (
      <div className="flex-1 flex items-center justify-center text-zinc-600">
        Select a note to start editing
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-zinc-900">
      <div className="border-b border-zinc-700 px-4 py-2">
        <input
          className="w-full text-xl font-semibold outline-none bg-transparent text-zinc-100 placeholder:text-zinc-600"
          value={state.activeNoteContent.title}
          onChange={(e) => {
            setState((s) => ({
              ...s,
              activeNoteContent: s.activeNoteContent
                ? { ...s.activeNoteContent, title: e.target.value }
                : null,
            }));
          }}
          onBlur={(e) => store.editTitle(e.target.value)}
          placeholder="Note title"
        />
      </div>
      <div className="flex-1 flex overflow-hidden">
        <textarea
          className="flex-1 p-4 resize-none outline-none font-mono text-sm border-r border-zinc-700 bg-zinc-900 text-zinc-200 placeholder:text-zinc-600"
          value={state.activeNoteContent.markdown}
          onChange={(e) => store.editMarkdown(e.target.value)}
          placeholder="Write markdown here..."
        />
        <div className="flex-1 p-4 overflow-y-auto prose prose-sm prose-invert max-w-none bg-zinc-900">
          <MarkdownPreview markdown={state.activeNoteContent.markdown} />
        </div>
      </div>
    </div>
  );
}
