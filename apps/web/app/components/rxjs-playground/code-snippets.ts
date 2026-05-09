/**
 * Snippety kodu dla każdego dema RxJS.
 * Ten plik nie ma dyrektywy "use client" — może być importowany przez server components.
 */

export const SUBJECT_CODE = `const subject$ = new Subject<string>();

// Subskrypcja 1
subject$.subscribe(v => console.log('Sub1:', v));

// Subskrypcja 2 — osobna, niezależna
subject$.subscribe(v => console.log('Sub2:', v));

// Ręczne emitowanie wartości
subject$.next('A');   // obie subskrypcje dostają 'A'
subject$.next('B');   // obie dostają 'B'
subject$.complete();  // obie kończą

// Po complete() — wartości są ignorowane
subject$.next('C');   // nic się nie dzieje`;

export const SWITCHMAP_CODE = `const click$ = new Subject<string>();
let requestId = 0;

click$.pipe(
  switchMap(query => {
    const id = ++requestId;

    // Symulacja HTTP request (3 sekundy)
    return timer(3000).pipe(
      map(() => \`Wynik dla: "\${query}" [req#\${id}]\`),
      tap({
        subscribe: () => log(\`req#\${id} START → "\${query}"\`),
        finalize: () => log(\`req#\${id} CANCEL/DONE\`)
      })
    );
  })
).subscribe(result => log('✓ ' + result));

// Szybkie kliknięcia:
click$.next('kot');    // req#1 START
click$.next('pies');   // req#1 CANCEL, req#2 START
// ... po 3s: req#2 DONE → "Wynik dla pies"`;

export const TAKEUNTIL_CODE = `const stop$ = new Subject<void>();

// Interval emituje 0, 1, 2, 3... co sekundę
interval(1000).pipe(
  takeUntil(stop$)   // kończy gdy stop$ emituje
).subscribe(tick => {
  console.log('tick:', tick);
});

// Gdzie indziej w kodzie:
stop$.next();   // strumień się kończy
// (np. w cleanup useEffect, albo onClick "Stop")


// W React:
useEffect(() => {
  const destroy$ = new Subject<void>();

  someStream$.pipe(
    takeUntil(destroy$)
  ).subscribe(...);

  return () => destroy$.next(); // cleanup!
}, []);`;

export const SCAN_CODE = `const addItem$ = new Subject<number>();

addItem$.pipe(
  scan((total, price) => total + price, 0)
  //     ^^^^^^^  akumulator (jak w Array.reduce)
  //              drugi arg = wartość startowa
).subscribe(total => {
  console.log('Suma koszyka:', total);
});

addItem$.next(29);  // → 29
addItem$.next(15);  // → 44
addItem$.next(99);  // → 143

// W chacie: scan((text, chunk) => text + chunk, '')
// akumuluje słowa SSE w pełen tekst odpowiedzi`;

export const DEBOUNCETIME_CODE = `const input$ = new Subject<string>();

input$.pipe(
  debounceTime(500),        // czeka 500ms ciszy
  distinctUntilChanged()    // ignoruje duplikaty
).subscribe(query => {
  // ten request wysyłany dopiero po 500ms ciszy
  fetchResults(query);
});

// Szybkie pisanie:
input$.next('r');       // reset timera
input$.next('rx');      // reset timera
input$.next('rxj');     // reset timera
input$.next('rxjs');    // reset timera
// ...500ms ciszy...
// → emituje tylko 'rxjs'  (1 request, nie 4!)`;

export const MERGE_CODE = `const a$ = new Subject<string>();
const b$ = new Subject<string>();

// merge — emituje gdy KTÓRYKOLWIEK zmieni wartość
merge(a$, b$).subscribe(v => {
  console.log('merge:', v);  // każde zdarzenie osobno
});

// combineLatest — emituje parę [lastA, lastB]
// czeka aż OBA raz wyemitują
combineLatest([a$, b$]).pipe(
  map(([a, b]) => \`\${a} + \${b}\`)
).subscribe(combined => {
  console.log('combineLatest:', combined);
});

a$.next('X');  // merge: 'X'  | combineLatest: czeka na B
b$.next('1');  // merge: '1'  | combineLatest: ['X','1'] ✓
a$.next('Y');  // merge: 'Y'  | combineLatest: ['Y','1']`;
