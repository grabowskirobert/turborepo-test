'use client';

/**
 * SUBJECT DEMO
 *
 * Subject to gorący Observable który możesz kontrolować ręcznie.
 * Masz 3 przyciski: next(A), next(B), complete()
 * Widzisz w logu co dokładnie dzieje się w strumieniu.
 */

import { useEffect, useRef, useState } from 'react';
import { Subject } from 'rxjs';
import { DemoShell, LogEntry, ts } from './DemoShell';

export function SubjectDemo({ codeBlock }: { codeBlock: React.ReactNode }) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [completed, setCompleted] = useState(false);
  const subject$ = useRef(new Subject<string>());

  const addLog = (label: string, value: string, color?: string) => {
    setLogs((prev) => [...prev, { time: ts(), label, value, color }]);
  };

  useEffect(() => {
    const sub1 = subject$.current.subscribe({
      next: (v) => addLog('Sub1 next', v, 'text-green-400'),
      complete: () => addLog('Sub1', 'complete() ✓', 'text-gray-500'),
    });
    const sub2 = subject$.current.subscribe({
      next: (v) => addLog('Sub2 next', v, 'text-blue-400'),
      complete: () => addLog('Sub2', 'complete() ✓', 'text-gray-500'),
    });
    return () => {
      sub1.unsubscribe();
      sub2.unsubscribe();
    };
  }, []);

  const handleNext = (value: string) => {
    if (completed) {
      addLog(
        'subject$',
        `next('${value}') — IGNOROWANE (po complete)`,
        'text-red-500',
      );
      return;
    }
    addLog('subject$', `next('${value}') →`, 'text-yellow-400');
    subject$.current.next(value);
  };

  const handleComplete = () => {
    if (completed) return;
    addLog('subject$', 'complete() →', 'text-yellow-400');
    subject$.current.complete();
    setCompleted(true);
  };

  const handleReset = () => {
    subject$.current = new Subject<string>();
    setCompleted(false);
    setLogs([]);
    // re-subscribe
    const sub1 = subject$.current.subscribe({
      next: (v) => addLog('Sub1 next', v, 'text-green-400'),
      complete: () => addLog('Sub1', 'complete() ✓', 'text-gray-500'),
    });
    const sub2 = subject$.current.subscribe({
      next: (v) => addLog('Sub2 next', v, 'text-blue-400'),
      complete: () => addLog('Sub2', 'complete() ✓', 'text-gray-500'),
    });
    // Leak prevention — store refs (simplified for demo)
    void sub1;
    void sub2;
  };

  return (
    <DemoShell
      title="Subject"
      operatorName="Subject"
      tagline="gorący Observable z ręczną kontrolą"
      codeBlock={codeBlock}
      logs={logs}
      onClearLogs={() => setLogs([])}
    >
      <p className="text-xs text-gray-500 mb-4">
        Są 2 subskrypcje (zielona i niebieska). Kliknij next — obie dostają
        wartość jednocześnie.
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handleNext('A')}
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-lg font-mono transition-colors"
        >
          next(&apos;A&apos;)
        </button>
        <button
          onClick={() => handleNext('B')}
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-lg font-mono transition-colors"
        >
          next(&apos;B&apos;)
        </button>
        <button
          onClick={() => handleNext('C')}
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-lg font-mono transition-colors"
        >
          next(&apos;C&apos;)
        </button>
        <button
          onClick={handleComplete}
          disabled={completed}
          className="px-4 py-2 bg-orange-800 hover:bg-orange-700 disabled:opacity-40 text-white text-sm rounded-lg font-mono transition-colors"
        >
          complete()
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-400 text-sm rounded-lg transition-colors"
        >
          reset
        </button>
      </div>
      {completed && (
        <p className="mt-3 text-xs text-orange-400">
          Subject jest zakończony. Kolejne next() są ignorowane.
        </p>
      )}
    </DemoShell>
  );
}
