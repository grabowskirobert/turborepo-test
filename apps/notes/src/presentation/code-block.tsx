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
      createHighlighter({ themes: ['github-dark'], langs: [lang] }).then(
        (highlighter) => {
          try {
            const highlighted = highlighter.codeToHtml(children, {
              lang,
              theme: 'github-dark',
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
      <pre className="bg-zinc-800 rounded p-3 overflow-x-auto text-zinc-300">
        <code>{children}</code>
      </pre>
    );
  }

  return (
    <div
      className="rounded overflow-x-auto [&>pre]:p-4 [&>pre]:rounded [&>pre]:m-0"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
