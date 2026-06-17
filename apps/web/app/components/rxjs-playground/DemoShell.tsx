'use client';

/**
 * DemoShell — wspólny wrapper dla każdego demo operatora.
 *
 * Lewa strona: interaktywne demo (przyciski, inputy)
 * Prawa strona: kod źródłowy + live log emitowanych wartości
 */

import { useEffect, useRef } from 'react';

export interface LogEntry {
  time: string;
  label: string;
  value: string;
  color?: string; // tailwind text color class
}

interface DemoShellProps {
  operatorName: string;
  tagline: string;
  codeBlock: React.ReactNode; // highlighted HTML z server component
  logs: LogEntry[];
  children: React.ReactNode; // interaktywna część
  onClearLogs: () => void;
}

export function DemoShell({
  operatorName,
  tagline,
  codeBlock,
  logs,
  children,
  onClearLogs,
}: DemoShellProps) {
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = logContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [logs]);

  return (
    <div className="border border-gray-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-5 py-3 flex items-baseline gap-3">
        <code className="text-purple-400 font-mono font-bold text-base">
          {operatorName}
        </code>
        <span className="text-gray-500 text-sm">{tagline}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-800">
        {/* LEWA: interaktywne demo */}
        <div className="p-5 bg-gray-950">
          <p className="text-xs text-gray-600 uppercase tracking-wider font-semibold mb-4">
            Demo
          </p>
          {children}
        </div>

        {/* PRAWA: kod + log */}
        <div className="flex flex-col bg-gray-950">
          {/* Kod */}
          <div className="border-b border-gray-800">
            <p className="text-xs text-gray-600 uppercase tracking-wider font-semibold px-5 pt-4 pb-2">
              Kod
            </p>
            <div className="px-5 pb-4">{codeBlock}</div>
          </div>

          {/* Live log */}
          <div
            ref={logContainerRef}
            className="flex-1 min-h-[140px] max-h-[220px] overflow-y-auto"
          >
            <div className="flex items-center justify-between px-5 pt-3 pb-1">
              <p className="text-xs text-gray-600 uppercase tracking-wider font-semibold">
                Log strumienia
              </p>
              {logs.length > 0 && (
                <button
                  onClick={onClearLogs}
                  className="cursor-pointer rounded-md bg-gray-800 px-2 py-1 text-xs font-semibold text-gray-200 transition-colors hover:bg-gray-700 hover:text-white"
                >
                  Wyczyść
                </button>
              )}
            </div>
            <div className="px-5 pb-3">
              {logs.length === 0 ? (
                <p className="text-xs text-gray-700 italic">
                  Kliknij coś w demo →
                </p>
              ) : (
                logs.map((entry, i) => (
                  <div key={i} className="flex gap-2 text-xs font-mono mb-1">
                    <span className="text-gray-700 shrink-0">{entry.time}</span>
                    <span
                      className={`shrink-0 ${entry.color ?? 'text-gray-500'}`}
                    >
                      [{entry.label}]
                    </span>
                    <span className="text-gray-300">{entry.value}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper do tworzenia timestampu
export function ts() {
  return new Date().toLocaleTimeString('pl-PL', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}
