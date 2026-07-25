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
  isSelected: boolean;
  onClick: (e: React.MouseEvent) => void;
  onImmediate: (value: string) => void;
  onBlur: (value: string) => void;
  onEscape: (currentValue: string) => void;
}

function EditableBlock({
  content,
  isEditing,
  isSelected,
  onClick,
  onImmediate,
  onBlur,
  onEscape,
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
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              e.preventDefault();
              onEscape(localValue);
            }
          }}
          onBlur={() => onBlur(localValue)}
        />
      </div>
    );
  }

  if (!content.trim()) return null;

  return (
    <div
      className={`cursor-pointer rounded -mx-2 px-2 transition-colors select-none ${
        isSelected
          ? 'bg-emerald-900/25 ring-1 ring-inset ring-emerald-500/30'
          : 'hover:bg-zinc-800/40'
      }`}
      onClick={onClick}
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
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(
    new Set(),
  );
  const [selectionAnchor, setSelectionAnchor] = useState<number | null>(null);
  // Prevents handleBlockBlur from double-processing when Escape already handled it
  const escapedRef = useRef(false);
  // Undo stack for block deletions (not for in-block typing, which has native undo)
  const undoStackRef = useRef<string[][]>([]);

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
      setSelectedIndices(new Set());
      setSelectionAnchor(null);
      undoStackRef.current = [];
    }
  }, [activeNoteId, state.activeNoteContent?.markdown]);

  useUnloadGuard(state.dirty);

  // Global keyboard handler for block-level operations
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const inField =
        target.tagName === 'TEXTAREA' || target.tagName === 'INPUT';

      // Cmd+A: select all blocks when not in a text field
      if ((e.metaKey || e.ctrlKey) && e.key === 'a' && !inField) {
        e.preventDefault();
        setSelectedIndices(
          new Set(Array.from({ length: blocks.length }, (_, i) => i)),
        );
        setSelectionAnchor(0);
        setEditingBlockIndex(null);
        return;
      }

      // Cmd+Z: undo the last block deletion
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !inField) {
        if (undoStackRef.current.length > 0) {
          e.preventDefault();
          const prev = undoStackRef.current[undoStackRef.current.length - 1]!;
          undoStackRef.current = undoStackRef.current.slice(0, -1);
          setBlocks(prev);
          setSelectedIndices(new Set());
          setSelectionAnchor(null);
          store.editMarkdown(joinBlocks(prev));
        }
        return;
      }

      if (inField || selectedIndices.size === 0) return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        undoStackRef.current = [...undoStackRef.current, blocks];
        const newBlocks = blocks.filter((_, i) => !selectedIndices.has(i));
        setBlocks(newBlocks);
        setSelectedIndices(new Set());
        setSelectionAnchor(null);
        store.editMarkdown(joinBlocks(newBlocks));
      } else if (e.key === 'Escape') {
        setSelectedIndices(new Set());
        setSelectionAnchor(null);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const idx = Math.min(...selectedIndices);
        setSelectedIndices(new Set());
        setEditingBlockIndex(idx);
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [blocks, selectedIndices, store]);

  function applyBlockEdit(index: number, value: string): string[] {
    const subBlocks = splitBlocks(value);
    if (subBlocks.length === 0) return blocks.filter((_, i) => i !== index);
    return [
      ...blocks.slice(0, index),
      ...subBlocks,
      ...blocks.slice(index + 1),
    ];
  }

  function handleBlockClick(index: number, e: React.MouseEvent) {
    if (editingBlockIndex === index) return;

    if (e.shiftKey && selectionAnchor !== null) {
      e.preventDefault();
      const min = Math.min(selectionAnchor, index);
      const max = Math.max(selectionAnchor, index);
      setSelectedIndices(
        new Set(Array.from({ length: max - min + 1 }, (_, i) => min + i)),
      );
      setEditingBlockIndex(null);
    } else if (e.metaKey || e.ctrlKey) {
      setEditingBlockIndex(null);
      setSelectedIndices((prev) => {
        const next = new Set(prev);
        if (next.has(index)) next.delete(index);
        else next.add(index);
        return next;
      });
      setSelectionAnchor(index);
    } else if (selectedIndices.size > 0) {
      if (selectedIndices.size === 1 && selectedIndices.has(index)) {
        // Second click on the sole selected block → enter edit mode
        setSelectedIndices(new Set());
        setEditingBlockIndex(index);
      } else {
        // Different block or multi-selection → replace selection
        setSelectedIndices(new Set([index]));
        setSelectionAnchor(index);
      }
    } else {
      // First click: select the block
      setSelectedIndices(new Set([index]));
      setSelectionAnchor(index);
    }
  }

  function handleBlockEscape(index: number, currentValue: string) {
    escapedRef.current = true;
    const newBlocks = applyBlockEdit(index, currentValue);
    setBlocks(newBlocks);
    store.editMarkdown(joinBlocks(newBlocks));
    setEditingBlockIndex(null);
    // Select the block at this position (or clear if it was deleted)
    if (newBlocks.length > index) {
      setSelectedIndices(new Set([index]));
      setSelectionAnchor(index);
    } else {
      setSelectedIndices(new Set());
      setSelectionAnchor(null);
    }
  }

  function handleBlockImmediate(index: number, value: string) {
    const tempBlocks = blocks.map((b, i) => (i === index ? value : b));
    store.editMarkdown(joinBlocks(tempBlocks));
  }

  function handleBlockBlur(index: number, value: string) {
    if (escapedRef.current) {
      escapedRef.current = false;
      return;
    }
    setEditingBlockIndex(null);
    const newBlocks = applyBlockEdit(index, value);
    setBlocks(newBlocks);
    store.editMarkdown(joinBlocks(newBlocks));
  }

  function clearSelection() {
    setSelectedIndices(new Set());
    setSelectionAnchor(null);
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
          onFocus={clearSelection}
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
          <div
            className="prose prose-invert max-w-none prose-headings:text-zinc-100 prose-p:text-zinc-300 prose-strong:text-zinc-100 prose-code:text-zinc-200 prose-li:text-zinc-300 prose-blockquote:text-zinc-400 prose-hr:border-zinc-700 prose-a:text-blue-400"
            onClick={(e) => {
              if (e.target === e.currentTarget) clearSelection();
            }}
          >
            {blocks.map((block, i) => (
              <EditableBlock
                key={i}
                content={block}
                isEditing={editingBlockIndex === i}
                isSelected={selectedIndices.has(i)}
                onClick={(e) => handleBlockClick(i, e)}
                onImmediate={(v) => handleBlockImmediate(i, v)}
                onBlur={(v) => handleBlockBlur(i, v)}
                onEscape={(v) => handleBlockEscape(i, v)}
              />
            ))}
          </div>
        )}
        <div
          className="min-h-16 cursor-text"
          onClick={() => {
            if (selectedIndices.size > 0) clearSelection();
            else addBlock();
          }}
        />
      </div>
    </div>
  );
}
