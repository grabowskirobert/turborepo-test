'use client';

import { useEffect, useRef, useState } from 'react';
import { Observable, Subject, UnaryFunction, pipe } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { DemoShell, LogEntry, ts } from './demo-shell';

function doubleEvens(): UnaryFunction<Observable<number>, Observable<number>> {
  return pipe(
    filter((value) => value % 2 === 0),
    map((value) => value * 2),
  );
}

export function CustomOperatorDemo({
  codeBlock,
}: {
  codeBlock: React.ReactNode;
}) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const number$ = useRef(new Subject<number>());

  const addLog = (label: string, value: string, color?: string) => {
    setLogs((prev) => [...prev, { time: ts(), label, value, color }]);
  };

  useEffect(() => {
    const currentNumber$ = number$.current;
    const sub = currentNumber$.pipe(doubleEvens()).subscribe((value) => {
      addLog('doubleEvens', `${value}`, 'text-green-400');
    });

    return () => {
      sub.unsubscribe();
      currentNumber$.complete();
    };
  }, []);

  const emit = (value: number) => {
    addLog('number$', `next(${value})`, 'text-yellow-400');
    if (value % 2 !== 0) {
      addLog('filter', `${value} odfiltrowane`, 'text-gray-500');
    }
    number$.current.next(value);
  };

  const reset = () => {
    setLogs([]);
  };

  return (
    <DemoShell
      operatorName="custom operator"
      tagline="własny operator jako kompozycja istniejących operatorów"
      codeBlock={codeBlock}
      logs={logs}
      onClearLogs={() => setLogs([])}
    >
      <p className="mb-4 text-xs text-gray-500">
        Operator <code className="text-purple-300">doubleEvens()</code> filtruje
        liczby nieparzyste, a parzyste mnoży razy 2. To zwykła czysta funkcja
        zwracająca operator dla <code className="text-purple-300">pipe()</code>.
      </p>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => emit(1)}
          className="rounded-lg bg-gray-800 px-3 py-2 font-mono text-xs text-white transition-colors hover:bg-gray-700"
        >
          number$.next(1)
        </button>
        <button
          onClick={() => emit(2)}
          className="rounded-lg bg-gray-800 px-3 py-2 font-mono text-xs text-white transition-colors hover:bg-gray-700"
        >
          number$.next(2)
        </button>
        <button
          onClick={() => emit(4)}
          className="rounded-lg bg-gray-800 px-3 py-2 font-mono text-xs text-white transition-colors hover:bg-gray-700"
        >
          number$.next(4)
        </button>
        <button
          onClick={reset}
          className="rounded-lg bg-purple-900/60 px-3 py-2 text-xs font-semibold text-purple-100 transition-colors hover:bg-purple-800 hover:text-white"
        >
          Reset
        </button>
      </div>
    </DemoShell>
  );
}
