'use client';

import { useState } from 'react';
import { concat, merge, of } from 'rxjs';
import { concatMap, delay } from 'rxjs/operators';
import { DemoShell, LogEntry, ts } from './demo-shell';

export function ConcatMergeDemo({ codeBlock }: { codeBlock: React.ReactNode }) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [running, setRunning] = useState(false);

  const addLog = (label: string, value: string, color?: string) => {
    setLogs((prev) => [...prev, { time: ts(), label, value, color }]);
  };

  const buildA$ = () =>
    of('A1', 'A2').pipe(concatMap((value) => of(value).pipe(delay(450))));
  const buildB$ = () =>
    of('B1', 'B2').pipe(concatMap((value) => of(value).pipe(delay(450))));

  const runConcat = () => {
    setRunning(true);
    addLog('concat', 'START: czeka na complete a$', 'text-yellow-400');
    concat(buildA$(), buildB$()).subscribe({
      next: (value) => addLog('concat', value, 'text-green-400'),
      complete: () => {
        addLog('concat', 'complete()', 'text-gray-500');
        setRunning(false);
      },
    });
  };

  const runMerge = () => {
    setRunning(true);
    addLog('merge', 'START: subskrybuje a$ i b$ od razu', 'text-yellow-400');
    merge(buildA$(), buildB$()).subscribe({
      next: (value) => addLog('merge', value, 'text-blue-400'),
      complete: () => {
        addLog('merge', 'complete()', 'text-gray-500');
        setRunning(false);
      },
    });
  };

  const reset = () => {
    setRunning(false);
    setLogs([]);
  };

  return (
    <DemoShell
      operatorName="concat vs merge"
      tagline="sekwencja kontra równoległe łączenie strumieni"
      codeBlock={codeBlock}
      logs={logs}
      onClearLogs={() => setLogs([])}
    >
      <p className="mb-4 text-xs text-gray-500">
        <code className="text-green-300">concat</code> odpala drugi strumień
        dopiero po zakończeniu pierwszego.{' '}
        <code className="text-blue-300">merge</code> odpala oba naraz.
      </p>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={runConcat}
          disabled={running}
          className="rounded-lg bg-green-800 px-3 py-2 font-mono text-xs text-white transition-colors hover:bg-green-700 disabled:opacity-40"
        >
          concat(a$, b$)
        </button>
        <button
          onClick={runMerge}
          disabled={running}
          className="rounded-lg bg-blue-800 px-3 py-2 font-mono text-xs text-white transition-colors hover:bg-blue-700 disabled:opacity-40"
        >
          merge(a$, b$)
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
