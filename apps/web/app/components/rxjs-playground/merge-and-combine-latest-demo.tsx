'use client';

/**
 * MERGE + COMBINLATEST DEMO
 *
 * merge: łączy strumienie — emituje gdy KTÓRYKOLWIEK emituje
 * combineLatest: emituje gdy KAŻDY emitował przynajmniej raz,
 *               potem przy każdej zmianie dowolnego
 */

import { useEffect, useRef, useState } from 'react';
import { Subject, Subscription, combineLatest, merge } from 'rxjs';
import { map } from 'rxjs/operators';
import { DemoShell, LogEntry, ts } from './demo-shell';

export function MergeAndCombineLatestDemo({
  codeBlock,
}: {
  codeBlock: React.ReactNode;
}) {
  const [mergeLogs, setMergeLogs] = useState<LogEntry[]>([]);
  const [combineLogs, setCombineLogs] = useState<LogEntry[]>([]);
  const [lastA, setLastA] = useState<string | null>(null);
  const [lastB, setLastB] = useState<string | null>(null);

  const a$ = useRef(new Subject<string>());
  const b$ = useRef(new Subject<string>());
  const subscriptions = useRef<Subscription[]>([]);
  const [emittedA2, setEmittedA2] = useState(false);

  const addMergeLog = (label: string, value: string, color?: string) => {
    setMergeLogs((prev) => [...prev, { time: ts(), label, value, color }]);
  };
  const addCombineLog = (label: string, value: string, color?: string) => {
    setCombineLogs((prev) => [...prev, { time: ts(), label, value, color }]);
  };

  const subscribeStreams = () => {
    subscriptions.current.forEach((sub) => sub.unsubscribe());
    subscriptions.current = [];

    subscriptions.current.push(
      merge(
        a$.current.pipe(map((v) => ({ src: 'A', val: v }))),
        b$.current.pipe(map((v) => ({ src: 'B', val: v }))),
      ).subscribe(({ src, val }) => {
        addMergeLog(
          `merge ← ${src}$`,
          val,
          src === 'A' ? 'text-blue-400' : 'text-orange-400',
        );
      }),
    );

    subscriptions.current.push(
      combineLatest([a$.current, b$.current])
        .pipe(map(([a, b]) => `[${a}, ${b}]`))
        .subscribe((combined) => {
          addCombineLog('combineLatest →', combined, 'text-green-400');
        }),
    );
  };

  useEffect(() => {
    subscriptions.current.push(
      merge(
        a$.current.pipe(map((v) => ({ src: 'A', val: v }))),
        b$.current.pipe(map((v) => ({ src: 'B', val: v }))),
      ).subscribe(({ src, val }) => {
        addMergeLog(
          `merge ← ${src}$`,
          val,
          src === 'A' ? 'text-blue-400' : 'text-orange-400',
        );
      }),
    );

    subscriptions.current.push(
      combineLatest([a$.current, b$.current])
        .pipe(map(([a, b]) => `[${a}, ${b}]`))
        .subscribe((combined) => {
          addCombineLog('combineLatest →', combined, 'text-green-400');
        }),
    );

    return () => {
      subscriptions.current.forEach((sub) => sub.unsubscribe());
    };
  }, []);

  const emitA = (val: 'A1' | 'A2') => {
    if (val === 'A2') setEmittedA2(true);
    setLastA(val);
    addMergeLog('A$.next', val, 'text-blue-300');
    a$.current.next(val);
  };

  const emitB = () => {
    const val = 'B1';
    setLastB(val);
    addMergeLog('B$.next', val, 'text-orange-300');
    b$.current.next(val);
  };

  const reset = () => {
    subscriptions.current.forEach((sub) => sub.unsubscribe());
    subscriptions.current = [];
    a$.current = new Subject<string>();
    b$.current = new Subject<string>();
    setLastA(null);
    setLastB(null);
    setEmittedA2(false);
    setMergeLogs([]);
    setCombineLogs([]);
    subscribeStreams();
  };

  // Połączone logi (merge + combine) do DemoShell — pokazujemy osobno
  const allLogs = [...mergeLogs, ...combineLogs].sort((a, b) =>
    a.time.localeCompare(b.time),
  );

  return (
    <DemoShell
      operatorName="merge / combineLatest"
      tagline="łączenie wielu strumieni w jeden"
      codeBlock={codeBlock}
      logs={allLogs}
      onClearLogs={() => {
        setMergeLogs([]);
        setCombineLogs([]);
      }}
    >
      <p className="text-xs text-gray-500 mb-4">
        Dwa niezależne strumienie A$ i B$. <br />
        <code className="text-blue-300">merge</code> — przepuszcza każde
        zdarzenie z obu.
        <br />
        <code className="text-green-300">combineLatest</code> — emituje parę
        dopiero gdy OBA raz wyemitowały.
      </p>

      {/* Status streams */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-gray-900 rounded-lg p-3">
          <p className="text-xs text-gray-600 mb-1">A$ ostatnia wartość</p>
          <p
            className={`text-lg font-mono font-bold ${lastA ? 'text-blue-400' : 'text-gray-700'}`}
          >
            {lastA ?? '—'}
          </p>
        </div>
        <div className="bg-gray-900 rounded-lg p-3">
          <p className="text-xs text-gray-600 mb-1">B$ ostatnia wartość</p>
          <p
            className={`text-lg font-mono font-bold ${lastB ? 'text-orange-400' : 'text-gray-700'}`}
          >
            {lastB ?? '—'}
          </p>
        </div>
      </div>

      {!lastA || !lastB ? (
        <p className="text-xs text-yellow-600 mb-3">
          ↑ combineLatest czeka aż OBA strumienie wyemitują przynajmniej raz
        </p>
      ) : (
        <p className="text-xs text-green-600 mb-3">
          ✓ combineLatest aktywny — emituje przy każdej zmianie A lub B
        </p>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => emitA('A1')}
          className="px-4 py-2 bg-blue-800 hover:bg-blue-700 text-white text-sm rounded-lg font-mono transition-colors"
        >
          A$.next(&apos;A1&apos;)
        </button>
        <button
          onClick={emitB}
          className="px-4 py-2 bg-orange-800 hover:bg-orange-700 text-white text-sm rounded-lg font-mono transition-colors"
        >
          B$.next(&apos;B1&apos;)
        </button>
        <button
          onClick={() => emitA('A2')}
          disabled={emittedA2}
          className="px-4 py-2 bg-blue-800 hover:bg-blue-700 disabled:opacity-40 text-white text-sm rounded-lg font-mono transition-colors"
        >
          A$.next(&apos;A2&apos;)
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
