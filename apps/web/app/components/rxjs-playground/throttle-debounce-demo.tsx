'use client';

import { useEffect, useRef, useState } from 'react';
import { Subject } from 'rxjs';
import { debounceTime, throttleTime } from 'rxjs/operators';
import { DemoShell, LogEntry, ts } from './demo-shell';

export function ThrottleDebounceDemo({
  codeBlock,
}: {
  codeBlock: React.ReactNode;
}) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const input$ = useRef(new Subject<string>());
  const runId = useRef(0);

  const addLog = (label: string, value: string, color?: string) => {
    setLogs((prev) => [...prev, { time: ts(), label, value, color }]);
  };

  useEffect(() => {
    const currentInput$ = input$.current;
    const debounceSub = currentInput$
      .pipe(debounceTime(700))
      .subscribe((value) => addLog('debounceTime', value, 'text-green-400'));
    const throttleSub = currentInput$
      .pipe(throttleTime(700))
      .subscribe((value) => addLog('throttleTime', value, 'text-blue-400'));

    return () => {
      debounceSub.unsubscribe();
      throttleSub.unsubscribe();
      currentInput$.complete();
    };
  }, []);

  const burst = () => {
    const currentRun = ++runId.current;
    ['1', '2', '3', '4'].forEach((value, index) => {
      window.setTimeout(() => {
        if (currentRun !== runId.current) return;
        addLog('input$', `next('${value}')`, 'text-yellow-400');
        input$.current.next(value);
      }, index * 120);
    });
  };

  const reset = () => {
    runId.current++;
    setLogs([]);
  };

  return (
    <DemoShell
      operatorName="debounceTime vs throttleTime"
      tagline="cisza po zdarzeniach kontra limitowanie okna czasu"
      codeBlock={codeBlock}
      logs={logs}
      onClearLogs={() => setLogs([])}
    >
      <p className="mb-4 text-xs text-gray-500">
        <code className="text-green-300">debounceTime</code> emituje ostatnią
        wartość po ciszy. <code className="text-blue-300">throttleTime</code>{' '}
        emituje pierwszą od razu i blokuje następne przez okno czasu.
      </p>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={burst}
          className="rounded-lg bg-purple-700 px-3 py-2 font-mono text-xs text-white transition-colors hover:bg-purple-600"
        >
          {"input$.next('1'), next('2'), next('3'), next('4')"}
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
