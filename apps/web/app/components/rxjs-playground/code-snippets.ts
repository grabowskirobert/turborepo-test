/**
 * Snippety kodu dla każdego dema RxJS.
 * Ten plik nie ma dyrektywy "use client" — może być importowany przez server components.
 *
 * WAŻNE: każdy snippet musi dokładnie odpowiadać temu co logowane jest w demie.
 */

// ─── SUBJECT ──────────────────────────────────────────────────────────────────
// Log: [subject$] next('A') →  /  [Sub1 next] A  /  [Sub2 next] A
//      [subject$] complete() →  /  [Sub1] complete() ✓  /  [Sub2] complete() ✓
//      [subject$] next('C') — IGNOROWANE (po complete)
export const SUBJECT_CODE = `const subject$ = new Subject<string>();

// Dwie niezależne subskrypcje
subject$.subscribe({
  next: v => log('[Sub1 next]', v),       // zielona
  complete: () => log('[Sub1] complete() ✓')
});
subject$.subscribe({
  next: v => log('[Sub2 next]', v),       // niebieska
  complete: () => log('[Sub2] complete() ✓')
});

subject$.next('A');
// → [subject$] next('A') →
// → [Sub1 next] A
// → [Sub2 next] A

subject$.complete();
// → [subject$] complete() →
// → [Sub1] complete() ✓
// → [Sub2] complete() ✓

subject$.next('C');
// → [subject$] next('C') — IGNOROWANE (po complete)`;

// ─── SWITCHMAP ────────────────────────────────────────────────────────────────
// Log: [req#N] START → "query"
//      [req#N] ANULOWANY przez switchMap ✗  (jeśli nowy przyszedł przed końcem)
//      [req#N] ✓ odpowiedź: "query"          (jeśli dobiegł do końca)
//      [req#N] ZAKOŃCZONY normalnie
export const SWITCHMAP_CODE = `const click$ = new Subject<string>();
let reqId = 0;

click$.pipe(
  switchMap(query => {
    const id = ++reqId;
    log(\`[req#\${id}] START → "\${query}"\`);

    let completed = false;

    return timer(3000).pipe(
      map(() => ({ id, query })),
      map(val => { completed = true; return val; }),
      finalize(() => {
        if (completed) {
          log(\`[req#\${id}] ZAKOŃCZONY normalnie\`);
        } else {
          // timer nie zdążył — switchMap nas anulował
          log(\`[req#\${id}] ANULOWANY przez switchMap ✗\`);
        }
      })
    );
  })
).subscribe(({ id, query }) => {
  log(\`[req#\${id}] ✓ odpowiedź: "\${query}"\`);
});

click$.next('kot');   // req#1 START
click$.next('pies');  // req#1 ANULOWANY, req#2 START
// po 3s → req#2 ✓ odpowiedź: "pies"`;

// ─── TAKEUNTIL ────────────────────────────────────────────────────────────────
// Log: [interval$] START — ticki co 1s
//      [tick] 0 / 1 / 2 ...
//      [stop$] next() → sygnał stop
//      [interval$] ZAKOŃCZONY przez takeUntil ✓
export const TAKEUNTIL_CODE = `const stop$ = new Subject<void>();

interval(1000).pipe(
  takeUntil(stop$)
).subscribe({
  next: tick => log('[tick]', tick),     // 0, 1, 2...
  complete: () => log('[interval$] ZAKOŃCZONY przez takeUntil ✓')
});

// Kliknięcie "stop$.next()":
stop$.next();
// → [stop$] next() → sygnał stop
// → [interval$] ZAKOŃCZONY przez takeUntil ✓

// Wzorzec cleanup w React:
useEffect(() => {
  const destroy$ = new Subject<void>();
  someStream$.pipe(takeUntil(destroy$)).subscribe(...);
  return () => destroy$.next(); // odpowiednik stop$.next()
}, []);`;

// ─── SCAN ─────────────────────────────────────────────────────────────────────
// Log: [next] +12 zł (Kawa)
//      [scan →] suma = 12 zł
//      [next] +49 zł (Książka RxJS)
//      [scan →] suma = 61 zł
export const SCAN_CODE = `const addItem$ = new Subject<number>();

addItem$.pipe(
  scan((total, price) => total + price, 0)
).subscribe(total => {
  log('[scan →]', \`suma = \${total} zł\`);
});

// Kliknięcie "Kawa +12 zł":
// → [next] +12 zł (Kawa)      ← przed next()
addItem$.next(12);
// → [scan →] suma = 12 zł     ← scan akumuluje

// Kliknięcie "Książka RxJS +49 zł":
// → [next] +49 zł (Książka RxJS)
addItem$.next(49);
// → [scan →] suma = 61 zł

// scan NIE przechowuje historii — tylko (akumulator, nowaWartość) → wynik`;

// ─── DEBOUNCETIME ─────────────────────────────────────────────────────────────
// Log: [keystroke] "r" / "rx" / "rxj" / "rxjs"   (szary — każde naciśnięcie)
//      [request →] fetchResults("rxjs")            (zielony — po 500ms ciszy)
export const DEBOUNCETIME_CODE = `const input$ = new Subject<string>();

input$.pipe(
  debounceTime(500),       // czeka 500ms ciszy
  distinctUntilChanged()   // ignoruje duplikaty
).subscribe(query => {
  log('[request →]', \`fetchResults("\${query}")\`);
});

// Szybkie pisanie (każdy znak → [keystroke] w logu):
input$.next('r');    // reset timera, brak emitu
input$.next('rx');   // reset timera, brak emitu
input$.next('rxj');  // reset timera, brak emitu
input$.next('rxjs'); // reset timera, brak emitu
// ...500ms ciszy...
// → [request →] fetchResults("rxjs")   // tylko 1 request!`;

// ─── MERGE + COMBINALATEST ────────────────────────────────────────────────────
// Log: [A$.next] A1        ← przed emit
//      [merge ← A$] A1    ← merge przepuszcza od razu
//      [B$.next] B1
//      [merge ← B$] B1
//      [combineLatest →] [A1, B1]   ← dopiero teraz, bo oba raz wyemitowały
export const MERGE_CODE = `const a$ = new Subject<string>();
const b$ = new Subject<string>();

// merge — każde zdarzenie z obu strumieni osobno
merge(a$, b$).subscribe(v => {
  log('[merge ←]', v);  // natychmiast przy każdym next()
});

// combineLatest — czeka aż OBA raz wyemitują,
// potem przy każdej zmianie dowolnego
combineLatest([a$, b$]).pipe(
  map(([a, b]) => \`[\${a}, \${b}]\`)
).subscribe(combined => {
  log('[combineLatest →]', combined);
});

a$.next('A1');
// → [merge ← A$] A1
// combineLatest: czeka na B$

b$.next('B1');
// → [merge ← B$] B1
// → [combineLatest →] [A1, B1]  ← pierwszy emit!

a$.next('A2');
// → [merge ← A$] A2
// → [combineLatest →] [A2, B1]  ← każda zmiana`;
