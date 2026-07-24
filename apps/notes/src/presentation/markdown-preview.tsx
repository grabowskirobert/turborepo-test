import { memo } from 'react';
import type { ReactElement } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { CodeBlock } from './code-block';
import { MermaidDiagram } from './mermaid-diagram';

interface MarkdownPreviewProps {
  markdown: string;
}

export const MarkdownPreview = memo(function MarkdownPreview({
  markdown,
}: MarkdownPreviewProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkBreaks]}
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
