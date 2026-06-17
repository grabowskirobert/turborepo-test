'use client';

/**
 * TAKEUNTIL DEMO
 *
 * Startuje interval (tick co sekundę).
 * takeUntil(stop$) zatrzymuje go gdy klikniesz Stop.
 *
 * To jest mechanizm cleanup przy unmount komponentu React.
 */

import { useEffect, useRef, useState } from 'react';
import { Subject, interval } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { DemoShell, LogEntry, ts } from './DemoShell';

export function TakeUntilDemo({ codeBlock }: { codeBlock: React.ReactNode }) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [running, setRunning] = useState(false);
  const stop$ = useRef(new Subject<void>());
  const tickRef = useRef(0);

  const addLog = (label: string, value: string, color?: string) => {
    setLogs((prev) => [...prev, { time: ts(), label, value, color }]);
  };

  const start = () => {
    if (running) return;
    stop$.current = new Subject<void>();
    tickRef.current = 0;
    setRunning(true);
    addLog('interval$', 'START — ticki co 1s', 'text-yellow-400');

    interval(1000)
      .pipe(
        takeUntil(stop$.current),
        tap({
          complete: () => {
            addLog(
              'interval$',
              'ZAKOŃCZONY przez takeUntil ✓',
              'text-gray-500',
            );
            setRunning(false);
          },
        }),
      )
      .subscribe((tick) => {
        addLog('tick', `${tick}`, 'text-green-400');
      });
  };

  const stop = () => {
    addLog('stop$', 'next() → sygnał stop', 'text-red-400');
    stop$.current.next();
  };

  const reset = () => {
    stop$.current.next();
    stop$.current.complete();
    stop$.current = new Subject<void>();
    tickRef.current = 0;
    setRunning(false);
    setLogs([]);
  };

  // Cleanup przy unmount — dokładnie ten sam wzorzec co w produkcji
  useEffect(() => {
    return () => {
      stop$.current.next();
      stop$.current.complete();
    };
  }, []);

  return (
    <DemoShell
      operatorName="takeUntil"
      tagline="kończy strumień gdy notifier$ emituje"
      codeBlock={codeBlock}
      logs={logs}
      onClearLogs={() => setLogs([])}
    >
      <p className="text-xs text-gray-500 mb-4">
        Startuje interval (tick co sekundę). Kliknij Stop —{' '}
        <code className="text-purple-300">stop$.next()</code> zatrzymuje
        strumień. Tak samo działa cleanup przy unmount komponentu.
      </p>

      <div className="mb-4 h-10 bg-gray-900 rounded-lg flex items-center px-3 text-xs font-mono">
        {running ? (
          <span className="text-green-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            interval aktywny — emituje ticki
          </span>
        ) : (
          <span className="text-gray-700">interval zatrzymany</span>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={start}
          disabled={running}
          className="px-4 py-2 bg-green-800 hover:bg-green-700 disabled:opacity-40 text-white text-sm rounded-lg font-mono transition-colors"
        >
          interval(1000).pipe(takeUntil(stop$))
        </button>
        <button
          onClick={stop}
          disabled={!running}
          className="px-4 py-2 bg-red-700 hover:bg-red-600 disabled:opacity-40 text-white text-sm rounded-lg font-mono transition-colors"
        >
          stop$.next()
        </button>
        <button
          onClick={reset}
          className="px-4 py-2 cursor-pointer bg-purple-900/60 hover:bg-purple-800 text-purple-100 hover:text-white text-sm rounded-lg font-semibold transition-colors"
        >
          Reset
        </button>
      </div>
    </DemoShell>
  );
}
