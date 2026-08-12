'use client';
import { useState, useEffect, useCallback } from 'react';
import {
  NodeViewContent,
  NodeViewWrapper,
  ReactNodeViewRenderer,
  type ReactNodeViewProps,
} from '@tiptap/react';
import CodeBlock from '@tiptap/extension-code-block';
import { MermaidDiagram } from './mermaid-diagram';
import type { BundledLanguage, Highlighter } from 'shiki';

let _highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter(): Promise<Highlighter> {
  if (!_highlighterPromise) {
    _highlighterPromise = import('shiki').then(({ createHighlighter }) =>
      createHighlighter({ themes: ['github-dark'], langs: ['plaintext'] }),
    );
  }
  return _highlighterPromise;
}

async function highlightCode(code: string, lang: string): Promise<string> {
  const hl = await getHighlighter();
  const targetLang = lang || 'plaintext';
  if (targetLang !== 'plaintext') {
    try {
      await hl.loadLanguage(targetLang as BundledLanguage);
    } catch {
      return hl.codeToHtml(code, { lang: 'plaintext', theme: 'github-dark' });
    }
  }
  return hl.codeToHtml(code, { lang: targetLang, theme: 'github-dark' });
}

function CodeBlockView({ node, editor, getPos }: ReactNodeViewProps) {
  const language = (node.attrs.language as string) || '';
  const code = node.textContent;
  const [highlighted, setHighlighted] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (language === 'mermaid') return;
    let cancelled = false;
    highlightCode(code, language)
      .then((html) => {
        if (!cancelled) setHighlighted(html);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [code, language]);

  // Track selection: switch to edit mode when cursor enters this node, exit when it leaves.
  useEffect(() => {
    const onSelectionUpdate = () => {
      const pos = getPos();
      if (pos === undefined) return;
      const { from } = editor.state.selection;
      setEditing(from > pos && from < pos + node.nodeSize);
    };
    editor.on('selectionUpdate', onSelectionUpdate);
    return () => {
      editor.off('selectionUpdate', onSelectionUpdate);
    };
  }, [editor, getPos, node.nodeSize]);

  const enterEditMode = useCallback(() => {
    const pos = getPos();
    if (pos === undefined) return;
    requestAnimationFrame(() => {
      editor
        .chain()
        .focus()
        .setTextSelection(pos + 1)
        .run();
    });
  }, [editor, getPos]);

  if (language === 'mermaid') {
    return (
      <NodeViewWrapper>
        <MermaidDiagram code={code} />
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper>
      {/*
       * NodeViewContent must stay in the DOM so ProseMirror can manage the code text.
       * sr-only hides it visually while keeping it accessible to ProseMirror.
       * When editing=true the pre becomes fully visible (globals.css .ProseMirror pre styles apply).
       */}
      <pre className={editing ? undefined : 'sr-only'}>
        <NodeViewContent as={'code' as 'div'} />
      </pre>

      {!editing && (
        <div
          className="cursor-text"
          role="button"
          tabIndex={0}
          onClick={enterEditMode}
          onKeyDown={(e) => e.key === 'Enter' && enterEditMode()}
        >
          {highlighted ? (
            <div dangerouslySetInnerHTML={{ __html: highlighted }} />
          ) : (
            <pre>
              <code>{code}</code>
            </pre>
          )}
        </div>
      )}
    </NodeViewWrapper>
  );
}

export const CodeBlockMermaid = CodeBlock.extend({
  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockView);
  },
});
