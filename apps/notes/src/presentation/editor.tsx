'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useEditor, EditorContent } from '@tiptap/react';
import { EditorState } from '@tiptap/pm/state';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import { Extension } from '@tiptap/core';
import {
  Table,
  TableRow,
  TableHeader,
  TableCell,
} from '@tiptap/extension-table';
import { CellSelection } from '@tiptap/pm/tables';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import { Markdown } from 'tiptap-markdown';
import type { MarkdownStorage } from 'tiptap-markdown';
import { TableCheckbox } from './table-checkbox';
import { serializeTable } from './table-serializer';
import { CodeBlockMermaid } from './code-block-mermaid';
import { LinkModal } from './link-modal';
import { getNotesStore } from '../core/store';
import type { NotesState } from '../core/store/notes-store';
import { useUnloadGuard } from '../integration/use-unload-guard';

function TBtn({
  children,
  onClick,
  danger,
  active,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
  active?: boolean;
  title?: string;
}) {
  return (
    <button
      onMouseDown={(e) => {
        e.preventDefault(); // keep editor focus
        onClick();
      }}
      title={title}
      className={`px-2 py-0.5 rounded transition-colors ${
        danger
          ? 'text-red-400 hover:bg-zinc-700'
          : active
            ? 'bg-zinc-600 text-zinc-100'
            : 'text-zinc-300 hover:bg-zinc-700'
      }`}
    >
      {children}
    </button>
  );
}

function Sep() {
  return <div className="w-px h-3 bg-zinc-600 mx-0.5 shrink-0" />;
}

function BulletListIcon() {
  return (
    <svg width="14" height="12" viewBox="0 0 14 12" fill="currentColor">
      <circle cx="1.5" cy="2" r="1.2" />
      <rect x="4" y="1" width="10" height="2" rx="0.8" />
      <circle cx="1.5" cy="6" r="1.2" />
      <rect x="4" y="5" width="10" height="2" rx="0.8" />
      <circle cx="1.5" cy="10" r="1.2" />
      <rect x="4" y="9" width="7" height="2" rx="0.8" />
    </svg>
  );
}

function OrderedListIcon() {
  return (
    <svg width="14" height="12" viewBox="0 0 14 12" fill="currentColor">
      <rect x="0.5" y="0" width="1.5" height="4" rx="0.5" />
      <rect x="4" y="1" width="10" height="2" rx="0.8" />
      <rect x="0" y="4.5" width="3" height="1.5" rx="0.5" />
      <rect x="0" y="6" width="3" height="1.5" rx="0.5" />
      <rect x="4" y="5" width="10" height="2" rx="0.8" />
      <rect x="0" y="8.5" width="3" height="1.5" rx="0.5" />
      <rect x="0" y="10" width="3" height="1.5" rx="0.5" />
      <rect x="4" y="9" width="7" height="2" rx="0.8" />
    </svg>
  );
}

function TaskListIcon() {
  return (
    <svg
      width="14"
      height="12"
      viewBox="0 0 14 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
    >
      <rect x="0.6" y="0.6" width="2.8" height="2.8" rx="0.5" />
      <line x1="5" y1="2" x2="14" y2="2" />
      <rect x="0.6" y="4.6" width="2.8" height="2.8" rx="0.5" />
      <line x1="5" y1="6" x2="14" y2="6" />
      <rect x="0.6" y="8.6" width="2.8" height="2.8" rx="0.5" />
      <line x1="5" y1="10" x2="11" y2="10" />
    </svg>
  );
}

function CodeIcon() {
  return (
    <svg
      width="14"
      height="12"
      viewBox="0 0 14 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="4,1 1,6 4,11" />
      <polyline points="10,1 13,6 10,11" />
    </svg>
  );
}

function HighlightIcon() {
  return (
    <svg width="14" height="12" viewBox="0 0 14 12" fill="currentColor">
      <rect x="1" y="7.5" width="12" height="3" rx="0.8" opacity="0.55" />
      <rect x="3.5" y="1" width="7" height="7" rx="1" />
    </svg>
  );
}

function QuoteIcon() {
  return (
    <svg width="14" height="12" viewBox="0 0 14 12" fill="currentColor">
      <rect x="0" y="1" width="2" height="10" rx="1" />
      <rect x="4" y="3" width="10" height="2" rx="0.8" />
      <rect x="4" y="6.5" width="7" height="2" rx="0.8" />
    </svg>
  );
}

function FormatBtn({
  children,
  active,
  title,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  title: string;
  onClick: () => void;
}) {
  return (
    <button
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      title={title}
      className={`flex items-center justify-center px-2.5 py-1.5 transition-colors ${
        active
          ? 'bg-zinc-600 text-zinc-100'
          : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/60'
      }`}
    >
      {children}
    </button>
  );
}

function ListTypeBtn({
  icon,
  label,
  active,
  title,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  title: string;
  onClick: () => void;
}) {
  return (
    <button
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      title={title}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 transition-colors ${
        active
          ? 'bg-zinc-600 text-zinc-100'
          : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/60'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
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

// GFM markdown tables cannot store newlines in cells — any hardBreak serializes
// as the literal text "[hardBreak]" and corrupts the stored note. Block Enter
// entirely inside cells; rows are added via the toolbar or Tab.
const TableCellEnter = Extension.create({
  name: 'tableCellEnter',
  addKeyboardShortcuts() {
    return {
      Enter: ({ editor }) => {
        if (editor.isActive('tableCell') || editor.isActive('tableHeader')) {
          return true; // consume, do nothing
        }
        return false;
      },
    };
  },
});

type LinkModalState =
  | { open: false }
  | {
      open: true;
      hasSelection: boolean;
      defaultText: string;
      defaultUrl: string;
    };

export function Editor() {
  const store = getNotesStore();
  const [state, setState] = useState<NotesState>(store.getState());
  const [linkModal, setLinkModal] = useState<LinkModalState>({ open: false });
  const pathname = usePathname();
  const prevPathRef = useRef(pathname);

  useEffect(() => store.subscribe(setState), [store]);

  useEffect(() => {
    if (prevPathRef.current !== pathname) {
      prevPathRef.current = pathname;
      store.flushPendingSave();
    }
  }, [pathname, store]);

  const openLinkModal = useCallback(
    (ed: NonNullable<ReturnType<typeof useEditor>>) => {
      const { from, to, empty } = ed.state.selection;
      const existingUrl = ed.getAttributes('link').href as string | undefined;
      const selectedText = empty ? '' : ed.state.doc.textBetween(from, to);
      setLinkModal({
        open: true,
        hasSelection: !empty,
        defaultText: selectedText,
        defaultUrl: existingUrl ?? '',
      });
    },
    [],
  );

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
      Highlight,
      Link.configure({ openOnClick: false, autolink: true }),
      Table.configure({ resizable: false }).extend({
        // tiptap-markdown's default table serializer falls back to writing the
        // literal text "[table]" (html:false mode) when any cell has >1 child
        // block (e.g. two paragraphs from Enter). Override to join children.
        addStorage() {
          return { markdown: { serialize: serializeTable, parse: {} } };
        },
      }),
      TableRow,
      TableHeader,
      TableCell,
      TaskList,
      TaskItem.configure({ nested: true }),
      TableCheckbox,
      TableCellEnter,
    ],
    content: state.activeNoteContent?.markdown ?? '',
    editorProps: {
      attributes: { class: PROSE_CLASSES },
    },
    onUpdate: ({ editor }) => {
      store.editMarkdown(getMarkdown(editor));
    },
  });

  // Cmd+K to open link modal
  useEffect(() => {
    if (!editor) return;
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        openLinkModal(editor);
      }
    };
    const el = editor.view.dom;
    el.addEventListener('keydown', handler);
    return () => el.removeEventListener('keydown', handler);
  }, [editor, openLinkModal]);

  // Block Cmd+S / Ctrl+S — prevents the browser's "Save page" dialog
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

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

  function applyLink(text: string, url: string) {
    if (!editor) return;
    setLinkModal({ open: false });
    if (linkModal.open && linkModal.hasSelection) {
      // Wrap selected text as a link
      editor.chain().focus().setLink({ href: url }).run();
    } else {
      // Insert new linked text at cursor
      editor
        .chain()
        .focus()
        .insertContent(`<a href="${url}">${text}</a>`)
        .run();
    }
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
        <>
          {/* Table cell selection toolbar */}
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

          {/* Link hover toolbar */}
          <BubbleMenu
            editor={editor}
            options={{ placement: 'bottom' }}
            shouldShow={({ editor }) => editor.isActive('link')}
          >
            <div className="flex items-center gap-1 bg-zinc-800 border border-zinc-600 rounded-lg px-2 py-1 shadow-xl text-xs select-none">
              <span className="text-zinc-400 max-w-[200px] truncate">
                {editor.getAttributes('link').href as string}
              </span>
              <Sep />
              <TBtn onClick={() => openLinkModal(editor)} title="Edit link">
                Edit
              </TBtn>
              <TBtn
                onClick={() => editor.chain().focus().unsetLink().run()}
                danger
                title="Remove link"
              >
                Unlink
              </TBtn>
            </div>
          </BubbleMenu>

          {/* Text selection formatting toolbar */}
          <BubbleMenu
            editor={editor}
            options={{ placement: 'top' }}
            shouldShow={({ editor }) =>
              !editor.state.selection.empty &&
              !(editor.state.selection instanceof CellSelection)
            }
          >
            <div className="flex items-stretch bg-zinc-800 border border-zinc-600 rounded-lg shadow-xl text-xs select-none overflow-hidden">
              <FormatBtn
                active={editor.isActive('bold')}
                title="Bold (⌘B)"
                onClick={() => editor.chain().focus().toggleBold().run()}
              >
                <span className="font-bold text-sm leading-none">B</span>
              </FormatBtn>
              <div className="w-px bg-zinc-700 shrink-0" />
              <FormatBtn
                active={editor.isActive('code')}
                title="Inline code"
                onClick={() => editor.chain().focus().toggleCode().run()}
              >
                <CodeIcon />
              </FormatBtn>
              <FormatBtn
                active={editor.isActive('highlight')}
                title="Highlight"
                onClick={() => editor.chain().focus().toggleHighlight().run()}
              >
                <HighlightIcon />
              </FormatBtn>
              <div className="w-px bg-zinc-700 shrink-0" />
              <FormatBtn
                active={editor.isActive('blockquote')}
                title="Blockquote"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
              >
                <QuoteIcon />
              </FormatBtn>
              <div className="w-px bg-zinc-700 shrink-0" />
              <FormatBtn
                active={editor.isActive('heading', { level: 1 })}
                title="Heading 1"
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 1 }).run()
                }
              >
                H1
              </FormatBtn>
              <FormatBtn
                active={editor.isActive('heading', { level: 2 })}
                title="Heading 2"
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 2 }).run()
                }
              >
                H2
              </FormatBtn>
              <FormatBtn
                active={editor.isActive('heading', { level: 3 })}
                title="Heading 3"
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 3 }).run()
                }
              >
                H3
              </FormatBtn>
            </div>
          </BubbleMenu>

          {/* List type conversion toolbar */}
          <BubbleMenu
            editor={editor}
            options={{ placement: 'top' }}
            shouldShow={({ editor }) =>
              editor.state.selection.empty &&
              (editor.isActive('bulletList') ||
                editor.isActive('orderedList') ||
                editor.isActive('taskList'))
            }
          >
            <div className="flex items-stretch bg-zinc-800 border border-zinc-600 rounded-lg shadow-xl text-xs select-none overflow-hidden">
              <span className="flex items-center text-zinc-500 text-[10px] px-2 uppercase tracking-wide border-r border-zinc-600 shrink-0">
                List
              </span>
              <ListTypeBtn
                icon={<BulletListIcon />}
                label="Bullet"
                active={editor.isActive('bulletList')}
                title="Convert to bullet list"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
              />
              <div className="w-px bg-zinc-700 shrink-0" />
              <ListTypeBtn
                icon={<OrderedListIcon />}
                label="Numbered"
                active={editor.isActive('orderedList')}
                title="Convert to numbered list"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
              />
              <div className="w-px bg-zinc-700 shrink-0" />
              <ListTypeBtn
                icon={<TaskListIcon />}
                label="Checklist"
                active={editor.isActive('taskList')}
                title="Convert to checklist"
                onClick={() => editor.chain().focus().toggleTaskList().run()}
              />
            </div>
          </BubbleMenu>
        </>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <EditorContent editor={editor} />
      </div>

      {linkModal.open && (
        <LinkModal
          hideText={linkModal.hasSelection}
          defaultText={linkModal.defaultText}
          defaultUrl={linkModal.defaultUrl}
          onConfirm={applyLink}
          onCancel={() => setLinkModal({ open: false })}
        />
      )}
    </div>
  );
}
