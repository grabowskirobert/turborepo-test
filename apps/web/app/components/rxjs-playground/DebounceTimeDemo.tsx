'use client';

/**
 * DEBOUNCETIME DEMO
 *
 * Bez debounce: każde naciśnięcie klawisza wysyła request.
 * Z debounce: czeka na przerwę w pisaniu (np. 500ms), dopiero wtedy emituje.
 *
 * Klasyczny przykład: wyszukiwarka live.
 */

import { useEffect, useRef, useState } from 'react';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { DemoShell, LogEntry, ts } from './DemoShell';

export function DebounceTimeDemo({
  codeBlock,
}: {
  codeBlock: React.ReactNode;
}) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [debouncedVal, setDebouncedVal] = useState('');
  const [keystrokeCount, setKeystrokeCount] = useState(0);
  const [requestCount, setRequestCount] = useState(0);
  const input$ = useRef(new Subject<string>());

  const addLog = (label: string, value: string, color?: string) => {
    setLogs((prev) => [...prev, { time: ts(), label, value, color }]);
  };

  useEffect(() => {
    const sub = input$.current
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((query) => {
        setDebouncedVal(query);
        setRequestCount((c) => c + 1);
        addLog('request →', `fetchResults("${query}")`, 'text-green-400');
      });

    return () => sub.unsubscribe();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputVal(val);
    setKeystrokeCount((c) => c + 1);
    addLog('keystroke', `"${val}"`, 'text-gray-500');
    input$.current.next(val);
  };

  return (
    <DemoShell
      title="debounceTime"
      operatorName="debounceTime"
      tagline="emituje dopiero po chwili ciszy — idealne do wyszukiwarek"
      codeBlock={codeBlock}
      logs={logs}
      onClearLogs={() => setLogs([])}
    >
      <p className="text-xs text-gray-500 mb-4">
        Pisz cokolwiek w polu. Każdy keystroke trafia do strumienia, ale{' '}
        <code className="text-purple-300">debounceTime(500)</code> wysyła
        request dopiero po 500ms ciszy.
      </p>

      <input
        value={inputVal}
        onChange={handleChange}
        placeholder="Zacznij pisać..."
        className="w-full bg-gray-900 text-gray-100 placeholder-gray-700 rounded-lg px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-purple-500 mb-4"
      />

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-900 rounded-lg p-3">
          <p className="text-xs text-gray-600 mb-1">
            Keystrokes (każde naciśnięcie)
          </p>
          <p className="text-xl font-mono font-bold text-red-400">
            {keystrokeCount}
          </p>
          <p className="text-xs text-gray-700 mt-1">
            bez debounce = {keystrokeCount} requestów
          </p>
        </div>
        <div className="bg-gray-900 rounded-lg p-3">
          <p className="text-xs text-gray-600 mb-1">
            Rzeczywiste requesty (po debounce)
          </p>
          <p className="text-xl font-mono font-bold text-green-400">
            {requestCount}
          </p>
          <p className="text-xs text-gray-500 mt-1 truncate">
            ostatnie: {debouncedVal ? `"${debouncedVal}"` : '—'}
          </p>
        </div>
      </div>
    </DemoShell>
  );
}
