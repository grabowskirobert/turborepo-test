import { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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
      remarkPlugins={[remarkGfm]}
      components={{
        code({ className, children, ...props }) {
          const match = /language-(\w+)/.exec(className ?? '');
          const language = match?.[1];
          const code = String(children).replace(/\n$/, '');

          if (language === 'mermaid') {
            return <MermaidDiagram code={code} />;
          }

          return (
            <CodeBlock language={language} {...props}>
              {code}
            </CodeBlock>
          );
        },
      }}
    >
      {markdown}
    </ReactMarkdown>
  );
});
