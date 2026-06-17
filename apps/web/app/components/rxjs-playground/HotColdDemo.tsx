'use client';

import { useEffect, useRef, useState } from 'react';
import { Observable, Subject, Subscription } from 'rxjs';
import { DemoShell, LogEntry, ts } from './DemoShell';

export function HotColdDemo({ codeBlock }: { codeBlock: React.ReactNode }) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [hotSubscribers, setHotSubscribers] = useState<string[]>([]);
  const coldRun = useRef(0);
  const hot$ = useRef(new Subject<string>());
  const hotSubs = useRef<Record<string, Subscription>>({});

  const addLog = (label: string, value: string, color?: string) => {
    setLogs((prev) => [...prev, { time: ts(), label, value, color }]);
  };

  const subscribeCold = (name: string) => {
    const run = ++coldRun.current;
    const cold$ = new Observable<string>((subscriber) => {
      addLog(
        'cold producer',
        `START dla ${name} (run #${run})`,
        'text-yellow-400',
      );
      subscriber.next('cold value');
      subscriber.complete();
    });

    cold$.subscribe({
      next: (value) => addLog(`Cold ${name}`, value, 'text-green-400'),
      complete: () => addLog(`Cold ${name}`, 'complete()', 'text-gray-500'),
    });
  };

  const subscribeHot = (name: string) => {
    if (hotSubs.current[name]) return;
    hotSubs.current[name] = hot$.current.subscribe((value) => {
      addLog(`Hot ${name}`, value, 'text-blue-400');
    });
    setHotSubscribers((prev) => [...prev, name]);
    addLog(
      'hot producer',
      `${name} podpięty do istniejącego strumienia`,
      'text-purple-300',
    );
  };

  const emitHot = () => {
    const value = 'H1';
    addLog('hot$', `next('${value}')`, 'text-yellow-400');
    hot$.current.next(value);
  };

  const reset = () => {
    Object.values(hotSubs.current).forEach((sub) => sub.unsubscribe());
    hotSubs.current = {};
    hot$.current = new Subject<string>();
    coldRun.current = 0;
    setHotSubscribers([]);
    setLogs([]);
  };

  useEffect(() => {
    const currentHotSubs = hotSubs.current;

    return () => {
      Object.values(currentHotSubs).forEach((sub) => sub.unsubscribe());
    };
  }, []);

  return (
    <DemoShell
      operatorName="hot vs cold"
      tagline="czy producent danych jest współdzielony"
      codeBlock={codeBlock}
      logs={logs}
      onClearLogs={() => setLogs([])}
    >
      <p className="text-xs text-gray-500 mb-4">
        Cold Observable uruchamia producenta per subskrypcja. Hot Observable ma
        producenta poza subskrypcją i wysyła do aktualnych subskrybentów.
      </p>

      <div className="mb-4 rounded-lg bg-gray-900 px-4 py-3 text-xs text-gray-500">
        Hot subscribers:{' '}
        <span className="font-mono text-blue-300">
          {hotSubscribers.length > 0 ? hotSubscribers.join(', ') : 'brak'}
        </span>
        . Jeśli podepniesz Sub A i Sub B, każde{' '}
        <code className="text-purple-300">hot$.next(...)</code> powinno dodać
        dwa logi: <code className="text-blue-300">[Hot Sub A]</code> i{' '}
        <code className="text-blue-300">[Hot Sub B]</code>.
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-600">
            Cold
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => subscribeCold('Sub A')}
              className="rounded-lg bg-green-800 px-3 py-2 font-mono text-xs text-white transition-colors hover:bg-green-700"
            >
              cold$.subscribe(Sub A)
            </button>
            <button
              onClick={() => subscribeCold('Sub B')}
              className="rounded-lg bg-green-800 px-3 py-2 font-mono text-xs text-white transition-colors hover:bg-green-700"
            >
              cold$.subscribe(Sub B)
            </button>
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-600">
            Hot
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => subscribeHot('Sub A')}
              disabled={hotSubscribers.includes('Sub A')}
              className="rounded-lg bg-blue-800 px-3 py-2 font-mono text-xs text-white transition-colors hover:bg-blue-700 disabled:opacity-40"
            >
              hot$.subscribe(Sub A)
            </button>
            <button
              onClick={() => subscribeHot('Sub B')}
              disabled={hotSubscribers.includes('Sub B')}
              className="rounded-lg bg-blue-800 px-3 py-2 font-mono text-xs text-white transition-colors hover:bg-blue-700 disabled:opacity-40"
            >
              hot$.subscribe(Sub B)
            </button>
            <button
              onClick={emitHot}
              className="rounded-lg bg-purple-700 px-3 py-2 font-mono text-xs text-white transition-colors hover:bg-purple-600"
            >
              hot$.next(&apos;H1&apos;)
            </button>
          </div>
        </div>
      </div>

      <button
        onClick={reset}
        className="mt-4 inline-flex cursor-pointer rounded-lg bg-purple-900/60 px-3 py-1.5 text-xs font-semibold text-purple-100 transition-colors hover:bg-purple-800 hover:text-white"
      >
        Reset
      </button>
    </DemoShell>
  );
}
