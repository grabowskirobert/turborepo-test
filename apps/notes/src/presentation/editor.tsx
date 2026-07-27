'use client';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useEditor, EditorContent } from '@tiptap/react';
import { EditorState } from '@tiptap/pm/state';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import {
  Table,
  TableRow,
  TableHeader,
  TableCell,
} from '@tiptap/extension-table';
import { CellSelection } from '@tiptap/pm/tables';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { Markdown } from 'tiptap-markdown';
import type { MarkdownStorage } from 'tiptap-markdown';
import { TableCheckbox } from './table-checkbox';
import { CodeBlockMermaid } from './code-block-mermaid';
import { getNotesStore } from '../core/store';
import type { NotesState } from '../core/store/notes-store';
import { useUnloadGuard } from '../integration/use-unload-guard';

function TBtn({
  children,
  onClick,
  danger,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
  title?: string;
}) {
  return (
    <button
      onMouseDown={(e) => {
        e.preventDefault(); // keep editor focus
        onClick();
      }}
      title={title}
      className={`px-2 py-0.5 rounded hover:bg-zinc-700 transition-colors ${
        danger ? 'text-red-400' : 'text-zinc-300'
      }`}
    >
      {children}
    </button>
  );
}

function Sep() {
  return <div className="w-px h-3 bg-zinc-600 mx-0.5 shrink-0" />;
}

const PROSE_CLASSES = [
  'outline-none min-h-[200px]',
  'prose prose-invert max-w-none',
  'prose-headings:text-zinc-100 prose-p:text-zinc-300',
  'prose-strong:text-zinc-100 prose-li:text-zinc-300',
  'prose-blockquote:text-zinc-400 prose-hr:border-zinc-700',
  'prose-a:text-blue-400',
].join(' ');

function getMarkdown(editor: ReturnType<typeof useEditor>): string {
  if (!editor) return '';
  return (
    editor.storage as unknown as { markdown: MarkdownStorage }
  ).markdown.getMarkdown();
}

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

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      CodeBlockMermaid,
      Markdown.configure({
        html: false,
        tightLists: true,
        bulletListMarker: '-',
        linkify: false,
        breaks: false,
        transformPastedText: true,
      }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
      TaskList,
      TaskItem.configure({ nested: true }),
      TableCheckbox,
    ],
    content: state.activeNoteContent?.markdown ?? '',
    editorProps: {
      attributes: { class: PROSE_CLASSES },
    },
    onUpdate: ({ editor }) => {
      store.editMarkdown(getMarkdown(editor));
    },
  });

  // Reload editor content when the active note changes
  const activeNoteId = state.activeNoteId;
  const prevNoteIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (!editor || prevNoteIdRef.current === activeNoteId) return;
    prevNoteIdRef.current = activeNoteId;
    editor.commands.setContent(
      store.getState().activeNoteContent?.markdown ?? '',
      { emitUpdate: false },
    );
    // Reset all plugin states (including undo history) so Cmd+Z can't
    // undo across a note switch and corrupt the wrong note's content.
    editor.view.updateState(
      EditorState.create({
        doc: editor.state.doc,
        schema: editor.state.schema,
        plugins: editor.state.plugins,
      }),
    );
  }, [activeNoteId, editor, store]);

  useUnloadGuard(state.dirty);

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
          onChange={(e) =>
            setState((s) => ({
              ...s,
              activeNoteContent: s.activeNoteContent
                ? { ...s.activeNoteContent, title: e.target.value }
                : null,
            }))
          }
          onBlur={(e) => store.editTitle(e.target.value)}
          placeholder="Note title"
        />
      </div>

      {editor && (
        <BubbleMenu
          editor={editor}
          options={{ placement: 'top' }}
          shouldShow={({ editor }) =>
            editor.state.selection instanceof CellSelection
          }
        >
          <div className="flex items-center gap-0.5 bg-zinc-800 border border-zinc-600 rounded-lg px-1.5 py-1 shadow-xl text-xs select-none">
            <span className="text-zinc-500 text-[10px] px-1 uppercase tracking-wide">
              Row
            </span>
            <TBtn
              onClick={() => editor.chain().focus().addRowBefore().run()}
              title="Add row above"
            >
              ↑
            </TBtn>
            <TBtn
              onClick={() => editor.chain().focus().addRowAfter().run()}
              title="Add row below"
            >
              ↓
            </TBtn>
            <TBtn
              onClick={() => editor.chain().focus().deleteRow().run()}
              danger
              title="Delete row"
            >
              ✕
            </TBtn>
            <Sep />
            <span className="text-zinc-500 text-[10px] px-1 uppercase tracking-wide">
              Col
            </span>
            <TBtn
              onClick={() => editor.chain().focus().addColumnBefore().run()}
              title="Add column left"
            >
              ←
            </TBtn>
            <TBtn
              onClick={() => editor.chain().focus().addColumnAfter().run()}
              title="Add column right"
            >
              →
            </TBtn>
            <TBtn
              onClick={() => editor.chain().focus().deleteColumn().run()}
              danger
              title="Delete column"
            >
              ✕
            </TBtn>
            <Sep />
            <TBtn
              onClick={() => editor.chain().focus().deleteTable().run()}
              danger
              title="Delete table"
            >
              Del table
            </TBtn>
          </div>
        </BubbleMenu>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
