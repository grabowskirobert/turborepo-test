import { memo } from 'react';
import type { ReactElement } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypeRaw from 'rehype-raw';
import type { Root } from 'mdast';
import { CodeBlock } from './code-block';
import { MermaidDiagram } from './mermaid-diagram';

// Converts <br> / <br /> html nodes inside table cells to mdast `break` nodes
// so mdast-util-to-hast emits a real <br> element (raw html nodes in table
// cells are not reliably processed by rehype-raw).
function remarkTableBr() {
  return (tree: Root) => {
    const queue: { node: unknown }[] = [{ node: tree }];
    while (queue.length) {
      const { node } = queue.shift()!;
      const n = node as { type: string; children?: unknown[]; value?: string };
      if (n.type === 'tableCell' && n.children) {
        n.children = n.children.map((child) => {
          const c = child as { type: string; value?: string };
          if (
            c.type === 'html' &&
            /^<br\s*\/?>$/i.test((c.value ?? '').trim())
          ) {
            return { type: 'break' };
          }
          return child;
        });
      }
      if (n.children) queue.push(...n.children.map((c) => ({ node: c })));
    }
  };
}

interface MarkdownPreviewProps {
  markdown: string;
}

export const MarkdownPreview = memo(function MarkdownPreview({
  markdown,
}: MarkdownPreviewProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkTableBr, remarkBreaks]}
      rehypePlugins={[rehypeRaw]}
      components={{
        // Intercept <pre> so we can render CodeBlock without a nested <pre> wrapper.
        // react-markdown wraps code blocks in <pre><code>; CodeBlock renders its own <pre>.
        pre({ children }) {
          const child = children as ReactElement<{
            className?: string;
            children?: string;
          }>;
          const className = child?.props?.className ?? '';
          const match = /language-(\w+)/.exec(className);
          const language = match?.[1];
          const code = String(child?.props?.children ?? '').replace(/\n$/, '');
          if (language === 'mermaid') return <MermaidDiagram code={code} />;
          return <CodeBlock language={language}>{code}</CodeBlock>;
        },
        // `code` is now only called for inline code (block code handled by `pre`)
        code({ className, children, ...props }) {
          return (
            <code className={className} {...props}>
              {children}
            </code>
          );
        },
      }}
    >
      {markdown}
    </ReactMarkdown>
  );
});
