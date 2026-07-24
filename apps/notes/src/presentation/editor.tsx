'use client';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { getNotesStore } from '../core/store';
import type { NotesState } from '../core/store/notes-store';
import { useUnloadGuard } from '../integration/use-unload-guard';
import { MarkdownPreview } from './markdown-preview';

function splitBlocks(markdown: string): string[] {
  if (!markdown.trim()) return [];
  const lines = markdown.split('\n');
  const blocks: string[] = [];
  let buf: string[] = [];
  let inFence = false;

  for (const line of lines) {
    if (/^```/.test(line)) {
      if (inFence) {
        buf.push(line);
        blocks.push(buf.join('\n'));
        buf = [];
        inFence = false;
      } else {
        if (buf.length) {
          blocks.push(buf.join('\n'));
          buf = [];
        }
        buf.push(line);
        inFence = true;
      }
    } else if (inFence) {
      buf.push(line);
    } else if (line.trim() === '') {
      if (buf.length) {
        blocks.push(buf.join('\n'));
        buf = [];
      }
    } else {
      buf.push(line);
    }
  }
  if (buf.length) blocks.push(buf.join('\n'));
  return blocks;
}

function joinBlocks(blocks: string[]): string {
  return blocks.join('\n\n');
}

interface EditableBlockProps {
  content: string;
  isEditing: boolean;
  onEdit: () => void;
  onImmediate: (value: string) => void;
  onBlur: (value: string) => void;
}

function EditableBlock({
  content,
  isEditing,
  onEdit,
  onImmediate,
  onBlur,
}: EditableBlockProps) {
  const [localValue, setLocalValue] = useState(content);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isEditing) setLocalValue(content);
  }, [content, isEditing]);

  useEffect(() => {
    if (isEditing && taRef.current) {
      const ta = taRef.current;
      ta.focus();
      ta.selectionStart = ta.selectionEnd = ta.value.length;
      ta.style.height = 'auto';
      ta.style.height = ta.scrollHeight + 'px';
    }
  }, [isEditing]);

  if (isEditing) {
    return (
      <div className="not-prose my-1">
        <textarea
          ref={taRef}
          className="w-full resize-none outline-none font-mono text-sm bg-zinc-800 text-zinc-200 rounded p-3 leading-relaxed border border-zinc-600 focus:border-zinc-400 transition-colors"
          value={localValue}
          onChange={(e) => {
            const v = e.target.value;
            setLocalValue(v);
            onImmediate(v);
            e.target.style.height = 'auto';
            e.target.style.height = e.target.scrollHeight + 'px';
          }}
          onBlur={() => onBlur(localValue)}
        />
      </div>
    );
  }

  if (!content.trim()) return null;

  return (
    <div
      className="cursor-text rounded -mx-2 px-2 hover:bg-zinc-800/40 transition-colors"
      onClick={onEdit}
    >
      <MarkdownPreview markdown={content} />
    </div>
  );
}

export function Editor() {
  const store = getNotesStore();
  const [state, setState] = useState<NotesState>(store.getState());
  const pathname = usePathname();
  const prevPathRef = useRef(pathname);
  const [blocks, setBlocks] = useState<string[]>(() =>
    splitBlocks(store.getState().activeNoteContent?.markdown ?? ''),
  );
  const [editingBlockIndex, setEditingBlockIndex] = useState<number | null>(
    null,
  );

  useEffect(() => store.subscribe(setState), [store]);

  useEffect(() => {
    if (prevPathRef.current !== pathname) {
      prevPathRef.current = pathname;
      store.flushPendingSave();
    }
  }, [pathname, store]);

  const activeNoteId = state.activeNoteId;
  const prevNoteIdRef = useRef(activeNoteId);
  useEffect(() => {
    if (prevNoteIdRef.current !== activeNoteId) {
      prevNoteIdRef.current = activeNoteId;
      setBlocks(splitBlocks(state.activeNoteContent?.markdown ?? ''));
      setEditingBlockIndex(null);
    }
  }, [activeNoteId, state.activeNoteContent?.markdown]);

  useUnloadGuard(state.dirty);

  function handleBlockImmediate(index: number, value: string) {
    const tempBlocks = blocks.map((b, i) => (i === index ? value : b));
    store.editMarkdown(joinBlocks(tempBlocks));
  }

  function handleBlockBlur(index: number, value: string) {
    setEditingBlockIndex(null);
    const subBlocks = splitBlocks(value);
    let newBlocks: string[];
    if (subBlocks.length === 0) {
      newBlocks = blocks.filter((_, i) => i !== index);
    } else {
      newBlocks = [
        ...blocks.slice(0, index),
        ...subBlocks,
        ...blocks.slice(index + 1),
      ];
    }
    setBlocks(newBlocks);
    store.editMarkdown(joinBlocks(newBlocks));
  }

  function addBlock() {
    const newBlocks = [...blocks, ''];
    setBlocks(newBlocks);
    setEditingBlockIndex(newBlocks.length - 1);
  }

  if (!state.activeNoteContent) {
    return (
      <div className="flex-1 flex items-center justify-center text-zinc-600 bg-zinc-900">
        Select a note to start editing
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-zinc-900">
      <div className="flex items-center h-12 border-b border-zinc-700 px-4">
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

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {blocks.length === 0 ? (
          <p
            className="text-zinc-600 cursor-text select-none"
            onClick={addBlock}
          >
            Click to start writing…
          </p>
        ) : (
          <div className="prose prose-invert max-w-none prose-headings:text-zinc-100 prose-p:text-zinc-300 prose-strong:text-zinc-100 prose-code:text-zinc-200 prose-li:text-zinc-300 prose-blockquote:text-zinc-400 prose-blockquote:border-zinc-600 prose-hr:border-zinc-700 prose-a:text-blue-400">
            {blocks.map((block, i) => (
              <EditableBlock
                key={i}
                content={block}
                isEditing={editingBlockIndex === i}
                onEdit={() => setEditingBlockIndex(i)}
                onImmediate={(v) => handleBlockImmediate(i, v)}
                onBlur={(v) => handleBlockBlur(i, v)}
              />
            ))}
          </div>
        )}
        <div className="min-h-16 cursor-text" onClick={addBlock} />
      </div>
    </div>
  );
}
