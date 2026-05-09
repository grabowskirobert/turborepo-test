/**
 * CodeBlock — async server component
 * Używa shiki do syntax highlighting (to samo co VS Code).
 * Renderuje HTML po stronie serwera — zero JS w przeglądarce.
 */

import { codeToHtml } from 'shiki';

interface CodeBlockProps {
  code: string;
  lang?: string;
}

export async function CodeBlock({ code, lang = 'typescript' }: CodeBlockProps) {
  const html = await codeToHtml(code, {
    lang,
    theme: 'vitesse-dark',
  });

  return (
    <div
      className="text-xs leading-relaxed overflow-x-auto [&>pre]:p-0 [&>pre]:bg-transparent! [&>pre]:m-0"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
