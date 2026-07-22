'use client';
import { useEffect, useState } from 'react';

interface CodeBlockProps {
  language: string | undefined;
  children: string;
}

export function CodeBlock({ language, children }: CodeBlockProps) {
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    const lang = language && language !== '' ? language : 'text';
    import('shiki').then(({ createHighlighter }) => {
      createHighlighter({ themes: ['github-light'], langs: [lang] }).then(
        (highlighter) => {
          try {
            const highlighted = highlighter.codeToHtml(children, {
              lang,
              theme: 'github-light',
            });
            setHtml(highlighted);
          } catch {
            setHtml(`<pre><code>${children}</code></pre>`);
          }
        },
      );
    });
  }, [language, children]);

  if (!html) {
    return (
      <pre className="bg-gray-100 rounded p-3 overflow-x-auto">
        <code>{children}</code>
      </pre>
    );
  }

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
