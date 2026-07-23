'use client';
import { useEffect, useRef, useState } from 'react';

interface MermaidDiagramProps {
  code: string;
}

export function MermaidDiagram({ code }: MermaidDiagramProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    let cancelled = false;

    import('mermaid').then(({ default: mermaid }) => {
      mermaid.initialize({
        startOnLoad: false,
        theme: 'dark',
        themeVariables: {
          background: '#27272a',
          primaryColor: '#3f3f46',
          primaryTextColor: '#e4e4e7',
          lineColor: '#71717a',
          secondaryColor: '#3f3f46',
          tertiaryColor: '#3f3f46',
        },
      });
      const id = 'mermaid-' + Math.random().toString(36).slice(2);
      mermaid
        .render(id, code)
        .then(({ svg }) => {
          if (!cancelled) {
            el.innerHTML = svg;
            setError(null);
          }
        })
        .catch((err: unknown) => {
          if (!cancelled) {
            setError(
              err instanceof Error ? err.message : 'Invalid mermaid syntax',
            );
            el.innerHTML = '';
          }
        });
    });

    return () => {
      cancelled = true;
    };
  }, [code]);

  if (error) {
    return (
      <div className="text-red-400 text-xs p-3 bg-red-950/40 border border-red-800/50 rounded font-mono">
        {error}
      </div>
    );
  }

  return (
    <div className="not-prose my-4 flex justify-center rounded-lg bg-zinc-800/60 border border-zinc-700 p-4">
      <div ref={ref} className="[&>svg]:max-w-full" />
    </div>
  );
}
