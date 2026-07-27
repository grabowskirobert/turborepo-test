'use client';
import {
  NodeViewContent,
  NodeViewWrapper,
  ReactNodeViewRenderer,
  type ReactNodeViewProps,
} from '@tiptap/react';
import CodeBlock from '@tiptap/extension-code-block';
import { MermaidDiagram } from './mermaid-diagram';

function CodeBlockView({ node }: ReactNodeViewProps) {
  const language = node.attrs.language as string;

  if (language === 'mermaid') {
    return (
      <NodeViewWrapper>
        <MermaidDiagram code={node.textContent} />
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper>
      <pre>
        <NodeViewContent as={'code' as 'div'} />
      </pre>
    </NodeViewWrapper>
  );
}

export const CodeBlockMermaid = CodeBlock.extend({
  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockView);
  },
});
