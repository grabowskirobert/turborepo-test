'use client';
import { useEffect, useState } from 'react';
import type { Highlighter, BundledLanguage } from 'shiki';

let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = import('shiki').then(({ createHighlighter }) =>
      createHighlighter({ themes: ['github-dark'], langs: [] }),
    );
  }
  return highlighterPromise;
}

interface CodeBlockProps {
  language: string | undefined;
  children: string;
}

export function CodeBlock({ language, children }: CodeBlockProps) {
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    const lang = language && language !== '' ? language : 'text';
    let active = true;

    getHighlighter().then(async (hl) => {
      const loaded = hl.getLoadedLanguages();
      if (!loaded.includes(lang)) {
        try {
          await hl.loadLanguage(lang as BundledLanguage);
        } catch {
          // Unknown language — will fall back to 'text'
        }
      }
      if (!active) return;
      try {
        const langToUse = hl.getLoadedLanguages().includes(lang)
          ? lang
          : 'text';
        setHtml(
          hl.codeToHtml(children, { lang: langToUse, theme: 'github-dark' }),
        );
      } catch {
        setHtml(`<pre><code>${children}</code></pre>`);
      }
    });

    return () => {
      active = false;
    };
  }, [language, children]);

  if (!html) {
    return (
      <pre className="bg-zinc-800 rounded p-4 overflow-x-auto text-zinc-300 text-sm">
        <code>{children}</code>
      </pre>
    );
  }

  return (
    <div
      className="not-prose rounded overflow-x-auto [&>pre]:p-4 [&>pre]:rounded [&>pre]:m-0 [&>pre]:text-sm [&>pre]:leading-relaxed"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
