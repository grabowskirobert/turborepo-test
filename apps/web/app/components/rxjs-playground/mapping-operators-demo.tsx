'use client';

import { useEffect, useRef, useState } from 'react';
import { Subject, Subscription, timer } from 'rxjs';
import {
  concatMap,
  exhaustMap,
  map,
  mergeMap,
  switchMap,
} from 'rxjs/operators';
import { DemoShell, LogEntry, ts } from './demo-shell';

const VALUES = ['A', 'B', 'C'];

export function MappingOperatorsDemo({
  codeBlock,
}: {
  codeBlock: React.ReactNode;
}) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const source$ = useRef(new Subject<string>());
  const subscriptions = useRef<Subscription[]>([]);
  const runId = useRef(0);

  const addLog = (label: string, value: string, color?: string) => {
    setLogs((prev) => [...prev, { time: ts(), label, value, color }]);
  };

  useEffect(() => {
    const currentSource$ = source$.current;
    const fakeRequest = (value: string, operator: string) =>
      timer(1000).pipe(map(() => `${operator} result ${value}`));

    subscriptions.current = [
      currentSource$
        .pipe(switchMap((value) => fakeRequest(value, 'switchMap')))
        .subscribe((value) => addLog('switchMap', value, 'text-purple-300')),
      currentSource$
        .pipe(concatMap((value) => fakeRequest(value, 'concatMap')))
        .subscribe((value) => addLog('concatMap', value, 'text-green-400')),
      currentSource$
        .pipe(mergeMap((value) => fakeRequest(value, 'mergeMap')))
        .subscribe((value) => addLog('mergeMap', value, 'text-blue-400')),
      currentSource$
        .pipe(exhaustMap((value) => fakeRequest(value, 'exhaustMap')))
        .subscribe((value) => addLog('exhaustMap', value, 'text-orange-400')),
    ];
    const currentSubscriptions = subscriptions.current;

    return () => {
      currentSubscriptions.forEach((sub) => sub.unsubscribe());
      currentSource$.complete();
    };
  }, []);

  const emitBurst = () => {
    const currentRun = ++runId.current;
    VALUES.forEach((value, index) => {
      window.setTimeout(() => {
        if (currentRun !== runId.current) return;
        addLog('source$', `next('${value}')`, 'text-yellow-400');
        source$.current.next(value);
      }, index * 120);
    });
  };

  const reset = () => {
    runId.current++;
    setLogs([]);
  };

  return (
    <DemoShell
      operatorName="switchMap / concatMap / mergeMap / exhaustMap"
      tagline="cztery strategie obsługi nakładających się inner Observable"
      codeBlock={codeBlock}
      logs={logs}
      onClearLogs={() => setLogs([])}
    >
      <p className="mb-4 text-xs text-gray-500">
        Każda wartość startuje request trwający 1s. Kliknij szybką serię i
        porównaj: najnowszy, kolejka, równolegle albo ignorowanie.
      </p>

      <div className="mb-4 grid gap-2 text-xs text-gray-500 sm:grid-cols-2">
        <p>
          <code className="text-purple-300">switchMap</code> anuluje poprzedni.
        </p>
        <p>
          <code className="text-green-300">concatMap</code> kolejkuje FIFO.
        </p>
        <p>
          <code className="text-blue-300">mergeMap</code> puszcza równolegle.
        </p>
        <p>
          <code className="text-orange-300">exhaustMap</code> ignoruje nowe w
          trakcie.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={emitBurst}
          className="rounded-lg bg-purple-700 px-3 py-2 font-mono text-xs text-white transition-colors hover:bg-purple-600"
        >
          {"source$.next('A'), source$.next('B'), source$.next('C')"}
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
