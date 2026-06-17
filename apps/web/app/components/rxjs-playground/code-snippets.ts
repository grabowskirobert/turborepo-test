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
  complete: () => log('[Sub1 complete]', '✓')
});
subject$.subscribe({
  next: v => log('[Sub2 next]', v),       // niebieska
  complete: () => log('[Sub2 complete]', '✓')
});

// Kliknięcie "next('A')":
// subject$.next('A');
// → [subject$] next('A') →
// → [Sub1 next] A
// → [Sub2 next] A

// Kliknięcie "complete()":
// subject$.complete();
// → [subject$] complete() →
// → [Sub1 complete] ✓
// → [Sub2 complete] ✓

// Kliknięcie "next('C')" po complete():
// subject$.next('C');
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

// Kliknięcie "kot":
// click$.next('kot');
// → [req#1] START → "kot"

// Kliknięcie "pies" zanim req#1 skończy:
// click$.next('pies');
// → [req#1] ANULOWANY przez switchMap ✗
// → [req#2] START → "pies"
// po 3s:
// → [req#2] ✓ odpowiedź: "pies"
// → [req#2] ZAKOŃCZONY normalnie`;

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
// stop$.next();
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
// addItem$.next(12);
// → [scan →] suma = 12 zł     ← scan akumuluje

// Kliknięcie "Książka RxJS +49 zł":
// → [next] +49 zł (Książka RxJS)
// addItem$.next(49);
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
// input$.next('r');    // reset timera, brak emitu
// → [keystroke] "r"
// input$.next('rx');   // reset timera, brak emitu
// → [keystroke] "rx"
// input$.next('rxj');  // reset timera, brak emitu
// → [keystroke] "rxj"
// input$.next('rxjs'); // reset timera, brak emitu
// → [keystroke] "rxjs"
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
merge(
  a$.pipe(map(v => ({ src: 'A', val: v }))),
  b$.pipe(map(v => ({ src: 'B', val: v })))
).subscribe(({ src, val }) => log(
  \`[merge ← \${src}$]\`,
  val
));

// combineLatest — czeka aż OBA raz wyemitują,
// potem przy każdej zmianie dowolnego
combineLatest([a$, b$]).pipe(
  map(([a, b]) => \`[\${a}, \${b}]\`)
).subscribe(combined => {
  log('[combineLatest →]', combined);
});

// Kliknięcie "A$.next('A1')":
// a$.next('A1');
// → [A$.next] A1
// → [merge ← A$] A1
// combineLatest: czeka na B$

// Kliknięcie "B$.next('B1')":
// b$.next('B1');
// → [B$.next] B1
// → [merge ← B$] B1
// → [combineLatest →] [A1, B1]  ← pierwszy emit!

// Kliknięcie "A$.next('A2')":
// a$.next('A2');
// → [A$.next] A2
// → [merge ← A$] A2
// → [combineLatest →] [A2, B1]  ← każda zmiana`;

// ─── HOT VS COLD ───────────────────────────────────────────────────────────────
export const HOT_COLD_CODE = `// Cold: producent powstaje dopiero przy subscribe()
const cold$ = new Observable<string>(subscriber => {
  log('[cold producer]', 'START dla Sub A (run #1)');
  subscriber.next('cold value');
  subscriber.complete();
});

// Każdy subscribe uruchamia niezależnego producenta
// Kliknięcie "cold$.subscribe(Sub A)":
// cold$.subscribe(v => log('[Cold Sub A]', v));
// → [cold producer] START dla Sub A (run #1)
// → [Cold Sub A] cold value
// → [Cold Sub A] complete()

// Kliknięcie "cold$.subscribe(Sub B)":
// cold$.subscribe(v => log('[Cold Sub B]', v));
// → [cold producer] START dla Sub B (run #2)
// → [Cold Sub B] cold value
// → [Cold Sub B] complete()

// Hot: producent istnieje poza Observable i emituje do wszystkich aktywnych
const hot$ = new Subject<string>();

// Kliknięcie "hot$.subscribe(Sub A)":
// hot$.subscribe(v => log('[Hot Sub A]', v));
// → [hot producer] Sub A podpięty do istniejącego strumienia

// Kliknięcie "hot$.subscribe(Sub B)":
// hot$.subscribe(v => log('[Hot Sub B]', v));
// → [hot producer] Sub B podpięty do istniejącego strumienia

// Kliknięcie "hot$.next('H1')":
// hot$.next('H1');
// → [hot$] next('H1')
// → [Hot Sub A] H1
// → [Hot Sub B] H1`;

// ─── BEHAVIORSUBJECT VS SUBJECT ────────────────────────────────────────────────
export const BEHAVIOR_SUBJECT_CODE = `const subject$ = new Subject<string>();
const behavior$ = new BehaviorSubject<string>('initial');

// Subject nie pamięta ostatniej wartości
// Kliknięcie "subject$.next('A')":
// subject$.next('A');
// → [subject$] next('A')

// Spóźniona subskrypcja nic nie dostaje od razu
// Kliknięcie "subject$.subscribe(lateSub)":
// subject$.subscribe(v => log('[Subject late]', v));
// → [Subject late] subscribe() - nie dostaje historii

// BehaviorSubject pamięta aktualny stan
// Kliknięcie "behavior$.next('A')":
// behavior$.next('A');
// → [behavior$] next('A')

// Spóźniona subskrypcja dostaje ostatnią wartość natychmiast
// Kliknięcie "behavior$.subscribe(lateSub)":
// behavior$.subscribe(v => log('[Behavior late]', v));
// → [Behavior late] A

// Dostęp synchroniczny do aktualnej wartości:
// behavior$.getValue();
// → [behavior$.getValue()] A`;

// ─── HIGHER-ORDER MAPPING ──────────────────────────────────────────────────────
export const MAPPING_OPERATORS_CODE = `const source$ = new Subject<string>();

source$.pipe(
  switchMap(value => fakeRequest(value, 'switchMap'))
).subscribe(result => log('[switchMap]', result));

source$.pipe(
  concatMap(value => fakeRequest(value, 'concatMap'))
).subscribe(result => log('[concatMap]', result));

source$.pipe(
  mergeMap(value => fakeRequest(value, 'mergeMap'))
).subscribe(result => log('[mergeMap]', result));

source$.pipe(
  exhaustMap(value => fakeRequest(value, 'exhaustMap'))
).subscribe(result => log('[exhaustMap]', result));

// Szybka seria kliknięć:
// source$.next('A');
// → [source$] next('A')
// source$.next('B');
// → [source$] next('B')
// source$.next('C');
// → [source$] next('C')

// Po ok. 1s:
// → [switchMap] switchMap result C
// → [mergeMap] mergeMap result A
// → [exhaustMap] exhaustMap result A
// → [mergeMap] mergeMap result B
// → [mergeMap] mergeMap result C
// potem kolejka concatMap:
// → [concatMap] concatMap result A
// → [concatMap] concatMap result B
// → [concatMap] concatMap result C`;

// ─── CONCAT VS MERGE ───────────────────────────────────────────────────────────
export const CONCAT_MERGE_CODE = `const a$ = from(['A1', 'A2']).pipe(delayEach(500));
const b$ = from(['B1', 'B2']).pipe(delayEach(500));

// concat czeka aż a$ się zakończy, dopiero potem startuje b$
concat(a$, b$).subscribe(v => log('[concat]', v));
// → [concat] START: czeka na complete a$
// → [concat] A1
// → [concat] A2
// → [concat] B1
// → [concat] B2
// → [concat] complete()

// merge subskrybuje oba strumienie od razu
merge(a$, b$).subscribe(v => log('[merge]', v));
// → [merge] START: subskrybuje a$ i b$ od razu
// → [merge] A1
// → [merge] B1
// → [merge] A2
// → [merge] B2
// → [merge] complete()`;

// ─── DEBOUNCE VS THROTTLE ──────────────────────────────────────────────────────
export const THROTTLE_DEBOUNCE_CODE = `const input$ = new Subject<string>();

input$.pipe(
  debounceTime(700)
).subscribe(v => log('[debounceTime]', v));

input$.pipe(
  throttleTime(700)
).subscribe(v => log('[throttleTime]', v));

// Szybka seria zdarzeń:
// input$.next('1');
// input$.next('2');
// input$.next('3');
// input$.next('4');

// → [input$] next('1')
// → [throttleTime] 1
// → [input$] next('2')
// → [input$] next('3')
// → [input$] next('4')
// po 700ms ciszy:
// → [debounceTime] 4`;

// ─── CUSTOM OPERATOR ───────────────────────────────────────────────────────────
export const CUSTOM_OPERATOR_CODE = `function doubleEvens(): UnaryFunction<Observable<number>, Observable<number>> {
  return pipe(
    filter(value => value % 2 === 0),
    map(value => value * 2)
  );
}

const number$ = new Subject<number>();

number$.pipe(
  doubleEvens()
).subscribe(result => log('[doubleEvens]', result));

// Kliknięcie "number$.next(1)":
// number$.next(1);
// → [number$] next(1)
// → [filter] 1 odfiltrowane

// Kliknięcie "number$.next(2)":
// number$.next(2);
// → [number$] next(2)
// → [doubleEvens] 4

// Kliknięcie "number$.next(4)":
// number$.next(4);
// → [number$] next(4)
// → [doubleEvens] 8`;
