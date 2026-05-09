'use client';

/**
 * SWITCHMAP DEMO
 *
 * Klikasz "Wyślij zapytanie" — startuje "request" (timer 3s).
 * Jeśli klikniesz ponownie zanim timer dobiegnie końca,
 * switchMap ANULUJE poprzedni i startuje nowy.
 *
 * To jest dokładnie to co dzieje się w chacie przy szybkich wiadomościach.
 */

import { useEffect, useRef, useState } from 'react';
import { Subject, timer } from 'rxjs';
import { switchMap, tap, finalize, map } from 'rxjs/operators';
import { DemoShell, LogEntry, ts } from './DemoShell';

export function SwitchMapDemo({ codeBlock }: { codeBlock: React.ReactNode }) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [activeReq, setActiveReq] = useState<number | null>(null);
  const [reqCounter, setReqCounter] = useState(0);
  const click$ = useRef(new Subject<string>());
  const queryCounter = useRef(0);
  const activeRef = useRef<number | null>(null);

  const addLog = (label: string, value: string, color?: string) => {
    setLogs((prev) => [...prev, { time: ts(), label, value, color }]);
  };

  useEffect(() => {
    const sub = click$.current
      .pipe(
        switchMap((query) => {
          const id = ++queryCounter.current;
          setReqCounter(id);
          setActiveReq(id);
          activeRef.current = id;

          addLog(`req#${id}`, `START → "${query}"`, 'text-yellow-400');

          return timer(3000).pipe(
            map(() => ({ id, query })),
            finalize(() => {
              // finalize mówi nam czy request dobiegł końca czy został anulowany
              // Sprawdzamy po aktywnym ID — jeśli inne jest już aktywne, to byliśmy anulowani
              setActiveReq((current) => {
                if (current !== id) {
                  addLog(
                    `req#${id}`,
                    `ANULOWANY przez switchMap ✗`,
                    'text-red-400',
                  );
                } else {
                  addLog(`req#${id}`, `ZAKOŃCZONY normalnie`, 'text-gray-500');
                  setActiveReq(null);
                }
                return current;
              });
            }),
          );
        }),
      )
      .subscribe(({ id, query }) => {
        addLog(`req#${id}`, `✓ odpowiedź: "${query}"`, 'text-green-400');
      });

    return () => sub.unsubscribe();
  }, []);

  const sendQuery = () => {
    const queries = ['kot', 'pies', 'ryba', 'żółw', 'papuga'];
    const q = queries[queryCounter.current % queries.length]!;
    click$.current.next(q);
  };

  return (
    <DemoShell
      title="switchMap"
      operatorName="switchMap"
      tagline="anuluje poprzedni stream gdy pojawia się nowy"
      codeBlock={codeBlock}
      logs={logs}
      onClearLogs={() => setLogs([])}
    >
      <p className="text-xs text-gray-500 mb-4">
        Każde kliknięcie startuje &quot;request&quot; (trwa 3s). Kliknij szybko
        kilka razy — zobaczysz że poprzednie są anulowane.
      </p>

      {/* Wizualny wskaźnik aktywnego requestu */}
      <div className="mb-4 h-10 bg-gray-900 rounded-lg flex items-center px-3 text-xs font-mono">
        {activeReq !== null ? (
          <span className="text-yellow-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
            req#{activeReq} w trakcie... (czeka 3s)
          </span>
        ) : (
          <span className="text-gray-700">brak aktywnego requestu</span>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={sendQuery}
          className="px-4 py-2 bg-purple-700 hover:bg-purple-600 text-white text-sm rounded-lg font-mono transition-colors"
        >
          click$.next() → nowe zapytanie
        </button>
      </div>

      <p className="mt-3 text-xs text-gray-600">
        Łącznie zapytań:{' '}
        <span className="text-purple-400 font-mono">{reqCounter}</span>
        {reqCounter > 1 && (
          <span className="text-red-400 ml-2">
            → {reqCounter - (activeReq ? 1 : 0)} anulowanych
          </span>
        )}
      </p>
    </DemoShell>
  );
}
