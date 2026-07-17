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
import { Subject, Subscription, timer } from 'rxjs';
import { switchMap, finalize, map } from 'rxjs/operators';
import { DemoShell, LogEntry, ts } from './demo-shell';

export function SwitchMapDemo({ codeBlock }: { codeBlock: React.ReactNode }) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [activeReq, setActiveReq] = useState<number | null>(null);
  const [reqCounter, setReqCounter] = useState(0);
  const click$ = useRef(new Subject<string>());
  const subscriptionRef = useRef<Subscription | null>(null);
  const queryCounter = useRef(0);
  // Ref przechowuje ID aktualnie aktywnego requestu — synchroniczny, bez race condition
  const activeIdRef = useRef<number | null>(null);

  const addLog = (label: string, value: string, color?: string) => {
    setLogs((prev) => [...prev, { time: ts(), label, value, color }]);
  };

  useEffect(() => {
    subscriptionRef.current = click$.current
      .pipe(
        switchMap((query) => {
          const id = ++queryCounter.current;
          // Ustawiamy aktywne ID synchronicznie — zanim cokolwiek zdąży się wykonać
          activeIdRef.current = id;
          setReqCounter(id);
          setActiveReq(id);
          addLog(`req#${id}`, `START → "${query}"`, 'text-yellow-400');

          // Flaga ustawiana przez subscriber — jeśli timer wyemituje, request się udał
          let completed = false;

          return timer(3000)
            .pipe(
              map(() => ({ id, query })),
              finalize(() => {
                // finalize odpala się zawsze: po next+complete LUB po unsubscribe (anulowanie).
                // Rozróżniamy te dwa przypadki przez flagę `completed`:
                // - jeśli true → timer zdążył wyemitować → normalny koniec
                // - jeśli false → switchMap nas odsubskrybował zanim timer trafił → anulowanie
                if (completed) {
                  addLog(`req#${id}`, `ZAKOŃCZONY normalnie`, 'text-gray-500');
                  setActiveReq(null);
                  activeIdRef.current = null;
                } else {
                  addLog(
                    `req#${id}`,
                    `ANULOWANY przez switchMap ✗`,
                    'text-red-400',
                  );
                }
              }),
            )
            .pipe(
              map((val) => {
                completed = true;
                return val;
              }),
            );
        }),
      )
      .subscribe(({ id, query }) => {
        addLog(`req#${id}`, `✓ odpowiedź: "${query}"`, 'text-green-400');
      });

    return () => subscriptionRef.current?.unsubscribe();
  }, []);

  const sendQuery = (query: string) => {
    click$.current.next(query);
  };

  const reset = () => {
    subscriptionRef.current?.unsubscribe();
    click$.current = new Subject<string>();
    queryCounter.current = 0;
    activeIdRef.current = null;
    setActiveReq(null);
    setReqCounter(0);
    setLogs([]);
    subscriptionRef.current = click$.current
      .pipe(
        switchMap((query) => {
          const id = ++queryCounter.current;
          activeIdRef.current = id;
          setReqCounter(id);
          setActiveReq(id);
          addLog(`req#${id}`, `START → "${query}"`, 'text-yellow-400');

          let completed = false;

          return timer(3000)
            .pipe(
              map(() => ({ id, query })),
              finalize(() => {
                if (completed) {
                  addLog(`req#${id}`, `ZAKOŃCZONY normalnie`, 'text-gray-500');
                  setActiveReq(null);
                  activeIdRef.current = null;
                } else {
                  addLog(
                    `req#${id}`,
                    `ANULOWANY przez switchMap ✗`,
                    'text-red-400',
                  );
                }
              }),
            )
            .pipe(
              map((val) => {
                completed = true;
                return val;
              }),
            );
        }),
      )
      .subscribe(({ id, query }) => {
        addLog(`req#${id}`, `✓ odpowiedź: "${query}"`, 'text-green-400');
      });
  };

  return (
    <DemoShell
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
          onClick={() => sendQuery('kot')}
          className="px-4 py-2 bg-purple-700 hover:bg-purple-600 text-white text-sm rounded-lg font-mono transition-colors"
        >
          click$.next(&apos;kot&apos;)
        </button>
        <button
          onClick={() => sendQuery('pies')}
          className="px-4 py-2 bg-purple-700 hover:bg-purple-600 text-white text-sm rounded-lg font-mono transition-colors"
        >
          click$.next(&apos;pies&apos;)
        </button>
        <button
          onClick={reset}
          className="px-4 py-2 cursor-pointer bg-purple-900/60 hover:bg-purple-800 text-purple-100 hover:text-white text-sm rounded-lg font-semibold transition-colors"
        >
          Reset
        </button>
      </div>

      <p className="mt-3 text-xs text-gray-600">
        Łącznie zapytań:{' '}
        <span className="text-purple-400 font-mono">{reqCounter}</span>
      </p>
    </DemoShell>
  );
}
