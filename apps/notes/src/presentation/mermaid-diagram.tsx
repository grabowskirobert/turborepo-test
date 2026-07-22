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
      mermaid.initialize({ startOnLoad: false, theme: 'default' });
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
      <div className="text-red-500 text-sm p-2 border border-red-200 rounded">
        {error}
      </div>
    );
  }

  return <div ref={ref} />;
}
