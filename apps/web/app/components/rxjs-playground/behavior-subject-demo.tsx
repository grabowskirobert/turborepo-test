'use client';

import { useEffect, useRef, useState } from 'react';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { DemoShell, LogEntry, ts } from './demo-shell';

export function BehaviorSubjectDemo({
  codeBlock,
}: {
  codeBlock: React.ReactNode;
}) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [subjectLateSubscribed, setSubjectLateSubscribed] = useState(false);
  const [behaviorLateSubscribed, setBehaviorLateSubscribed] = useState(false);
  const [behaviorCurrent, setBehaviorCurrent] = useState('initial');
  const subject$ = useRef(new Subject<string>());
  const behavior$ = useRef(new BehaviorSubject<string>('initial'));
  const subscriptions = useRef<Subscription[]>([]);

  const addLog = (label: string, value: string, color?: string) => {
    setLogs((prev) => [...prev, { time: ts(), label, value, color }]);
  };

  const emitSubject = () => {
    const value = 'A';
    addLog('subject$', `next('${value}')`, 'text-yellow-400');
    subject$.current.next(value);
  };

  const emitBehavior = () => {
    const value = 'A';
    addLog('behavior$', `next('${value}')`, 'text-yellow-400');
    behavior$.current.next(value);
    setBehaviorCurrent(value);
  };

  const subscribeSubjectLate = () => {
    if (subjectLateSubscribed) return;
    subscriptions.current.push(
      subject$.current.subscribe((value) => {
        addLog('Subject late', value, 'text-green-400');
      }),
    );
    setSubjectLateSubscribed(true);
    addLog(
      'Subject late',
      'subscribe() - nie dostaje historii',
      'text-gray-500',
    );
  };

  const subscribeBehaviorLate = () => {
    if (behaviorLateSubscribed) return;
    subscriptions.current.push(
      behavior$.current.subscribe((value) => {
        addLog('Behavior late', value, 'text-blue-400');
      }),
    );
    setBehaviorLateSubscribed(true);
  };

  const readCurrent = () => {
    addLog(
      'behavior$.getValue()',
      behavior$.current.getValue(),
      'text-purple-300',
    );
  };

  const reset = () => {
    subscriptions.current.forEach((sub) => sub.unsubscribe());
    subscriptions.current = [];
    subject$.current = new Subject<string>();
    behavior$.current = new BehaviorSubject<string>('initial');
    setSubjectLateSubscribed(false);
    setBehaviorLateSubscribed(false);
    setBehaviorCurrent('initial');
    setLogs([]);
  };

  useEffect(() => {
    const currentSubscriptions = subscriptions.current;
    const currentSubject$ = subject$.current;
    const currentBehavior$ = behavior$.current;

    return () => {
      currentSubscriptions.forEach((sub) => sub.unsubscribe());
      currentSubject$.complete();
      currentBehavior$.complete();
    };
  }, []);

  return (
    <DemoShell
      operatorName="BehaviorSubject vs Subject"
      tagline="stan ostatniej wartości kontra zwykły multicast"
      codeBlock={codeBlock}
      logs={logs}
      onClearLogs={() => setLogs([])}
    >
      <p className="mb-4 text-xs text-gray-500">
        Subject nie pamięta wartości. BehaviorSubject zawsze ma aktualny stan i
        od razu oddaje go nowej subskrypcji.
      </p>

      <div className="mb-4 rounded-lg bg-gray-900 px-4 py-3">
        <p className="text-xs text-gray-600">BehaviorSubject current value</p>
        <p className="font-mono text-xl font-bold text-blue-400">
          {behaviorCurrent}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={emitSubject}
          className="rounded-lg bg-green-800 px-3 py-2 font-mono text-xs text-white transition-colors hover:bg-green-700"
        >
          subject$.next(&apos;A&apos;)
        </button>
        <button
          onClick={subscribeSubjectLate}
          disabled={subjectLateSubscribed}
          className="rounded-lg bg-green-950 px-3 py-2 font-mono text-xs text-white transition-colors hover:bg-green-900 disabled:opacity-40"
        >
          subject$.subscribe(lateSub)
        </button>
        <button
          onClick={emitBehavior}
          className="rounded-lg bg-blue-800 px-3 py-2 font-mono text-xs text-white transition-colors hover:bg-blue-700"
        >
          behavior$.next(&apos;A&apos;)
        </button>
        <button
          onClick={subscribeBehaviorLate}
          disabled={behaviorLateSubscribed}
          className="rounded-lg bg-blue-950 px-3 py-2 font-mono text-xs text-white transition-colors hover:bg-blue-900 disabled:opacity-40"
        >
          behavior$.subscribe(lateSub)
        </button>
        <button
          onClick={readCurrent}
          className="rounded-lg bg-purple-800 px-3 py-2 font-mono text-xs text-white transition-colors hover:bg-purple-700"
        >
          behavior$.getValue()
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
