'use client';

/**
 * SCAN DEMO
 *
 * scan to reduce() ale dla strumieni — akumuluje wartości w czasie.
 * Przykład: koszyk zakupów. Każde kliknięcie dodaje produkt,
 * scan akumuluje sumę.
 */

import { useEffect, useRef, useState } from 'react';
import { Subject } from 'rxjs';
import { scan } from 'rxjs/operators';
import { DemoShell, LogEntry, ts } from './DemoShell';

const ITEMS = [
  { name: 'Kawa', price: 12 },
  { name: 'Książka RxJS', price: 49 },
];

export function ScanDemo({ codeBlock }: { codeBlock: React.ReactNode }) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [cart, setCart] = useState<string[]>([]);
  const add$ = useRef(new Subject<number>());

  const addLog = (label: string, value: string, color?: string) => {
    setLogs((prev) => [...prev, { time: ts(), label, value, color }]);
  };

  useEffect(() => {
    const sub = add$.current
      .pipe(scan((acc, price) => acc + price, 0))
      .subscribe((total) => {
        setTotal(total);
        addLog('scan →', `suma = ${total} zł`, 'text-green-400');
      });

    return () => sub.unsubscribe();
  }, []);

  const addItem = (name: string, price: number) => {
    addLog('next', `+${price} zł (${name})`, 'text-yellow-400');
    setCart((prev) => [...prev, name]);
    add$.current.next(price);
  };

  const reset = () => {
    add$.current = new Subject<number>();
    setTotal(0);
    setCart([]);
    setLogs([]);

    const sub = add$.current
      .pipe(scan((acc, price) => acc + price, 0))
      .subscribe((total) => {
        setTotal(total);
        addLog('scan →', `suma = ${total} zł`, 'text-green-400');
      });
    void sub;
  };

  return (
    <DemoShell
      operatorName="scan"
      tagline="akumuluje wartości strumienia (jak reduce dla tablic)"
      codeBlock={codeBlock}
      logs={logs}
      onClearLogs={() => setLogs([])}
    >
      <p className="text-xs text-gray-500 mb-4">
        Każdy klik dodaje produkt. <code className="text-purple-300">scan</code>{' '}
        akumuluje sumę bez przechowywania historii — tylko akumulator i nowa
        wartość.
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        {ITEMS.map((item) => (
          <button
            key={item.name}
            onClick={() => addItem(item.name, item.price)}
            className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs rounded-lg font-mono transition-colors"
          >
            addItem$.next({item.price})
          </button>
        ))}
      </div>

      <div className="bg-gray-900 rounded-lg px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-600 mb-1">
            Koszyk ({cart.length} szt.)
          </p>
          <p className="text-xs text-gray-500 truncate max-w-[200px]">
            {cart.length > 0 ? cart.join(', ') : 'pusty'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-600 mb-1">Suma (scan output)</p>
          <p className="text-2xl font-mono font-bold text-green-400">
            {total} zł
          </p>
        </div>
      </div>

      <button
        onClick={reset}
        className="mt-3 inline-flex cursor-pointer rounded-lg bg-purple-900/60 px-3 py-1.5 text-xs font-semibold text-purple-100 transition-colors hover:bg-purple-800 hover:text-white"
      >
        Reset
      </button>
    </DemoShell>
  );
}
