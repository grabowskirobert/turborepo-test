# QA Checklist — FEAT-003 Visual Debug Overlay

> Przed commitem odhacz każdy punkt. Wersja: 2026-01-26

---

## a. Wizualizacja kolorów

Otwórz `http://localhost:3001`, przewijaj stronę.

- [x] **Magenta rootMargin** — strefa rootMargin elementów (fixture B: `50px 0px`, fixture F: `300px 0px`) renderuje się w kolorze `rgba(255, 0, 255, 0.3)`
- [x] **Neon Green intersection** — gdy element przecina viewport, pojawia się zielone podświetlenie `rgba(0, 255, 0, 0.3)`
  > Testuj na **Fixture H** (prawy górny róg ekranu, widoczny od razu po załadowaniu). Element jest above the fold i obserwowany bez `rootMargin` → `isIntersecting: true` natychmiast → powinien pokazać zielone wypełnienie i żółtą ramkę, **bez magenty**.
  > Zielony jest zawsze renderowany **ponad** wszystkimi magentowymi strefami (trzy-przebiegowy render w `VisualOverlay.tsx`). Każdy przebieg jest opakowany w `isolation: isolate` — magentas screen-blendują między sobą (sygnał gęstości), a zielone composit normalnie na warstwę magenty bez cross-layer screen blendingu. Bez izolacji zielony + magenta = cyjan/biały.
- [x] **Yellow dashed border** — `targetRect` otoczony żółtą kreskowaną ramką 2px
- [x] **Additive blending** — nakładające się overlaye kumulują jasność (`mix-blend-mode: screen`) zamiast się zakrywać

---

## b. Izolacja techniczna

- [x] **Portal / Shadow DOM** — w DevTools: rozwiń `<div id="__io-detector-root">` → `#shadow-root (open)` → `<div class="io-detector-container">` → tu jest `io-overlay-canvas`. Host element jest bezpośrednio w `<body>`, ale sama nakładka żyje w izolowanym shadow tree.
- [ ] **`pointer-events: none`** — kliknięcia na linki/karty przechodzą przez overlay (brak blokowania)
- [ ] **⚠️ Z-index** — spec wymaga `2147483647`; CSS ma `z-index: 10` (Shadow DOM ma izolowany stacking context — zweryfikuj wizualnie czy overlay wyświetla się **ponad** wszystkimi elementami strony; jeśli nie — podnieść wartość)

---

## c. Dual-Loop / Cheap Cull

- [ ] **Loop A (200ms)** — DevTools Performance: `tickLoopA` pojawia się co ~200ms, nie każda klatka
- [ ] **Loop B (rAF)** — pozycje overlayów aktualizują się płynnie przy przewijaniu
- [ ] **Cheap Cull** — element przewinięty poza viewport natychmiast znika (`opacity: 0`) bez czekania na kolejny tick Loop A

---

## d. Three-Tier Safety System

- [ ] **Tier 1 (domyślny, 0–30)** — status pill: `🟢 System Active`; overlaye widoczne od razu
- [ ] **Tier 2 (31–50)** — dodaj >30 observerów w Console:
  ```js
  for (let i = 0; i < 35; i++)
    new IntersectionObserver(() => {}).observe(document.body);
  ```
  Status: `⚠️ Visual Limit Reached (30/35 shown)`; max 30 overlayów
- [ ] **Tier 3 (51+)** — dodaj >50 observerów jak wyżej:
  - Status: `⚠️ High Load (50+). Visuals disabled.`
  - Overlaye automatycznie znikają
  - Pojawia się przycisk `Enable Visuals`

---

## e. Smart Queue (Tier 2/3 z włączonymi visualami)

- [ ] Elementy **aktualnie przecinające viewport** (`isIntersecting: true`) mają overlaye pokazane jako pierwsze (przed off-screen)
- [ ] Przy równych priorytetach — mniejsze powierzchniowo elementy (`width × height`) są preferowane

---

## f. Kontrole użytkownika

- [ ] **Manual Toggle** — w Tier 3 kliknij `Enable Visuals`: overlaye się pokazują (max 30); `Disable Visuals`: znikają
- [ ] **Hysteresis** — będąc w Tier 3 (visuals OFF), usuń observery by spaść do Tier 1; overlaye **nie** włączają się automatycznie (pozostają OFF)
- [ ] **Spot Check / Force-Show** — najedź myszką na wiersz w panelu monitora; overlay pojawia się natychmiast, nawet gdy visuals są globalnie wyłączone

---

## g. Zombie Exclusion — Fixture G

- [ ] Kliknij `"Spawn Zombie"` w sekcji G; poczekaj ~5s
- [ ] Obserwator oznaczony jako zombie w panelu (inna ikonka/kolor)
- [ ] Zombie **nie ma** overlaya na ekranie
- [ ] Licznik observerów dla tieru **nie** liczy zombie

---

## h. Build / TypeScript

- [ ] `pnpm check-types` — zero błędów TS
- [ ] `pnpm build` — paczka `@repo/io-detector` buduje się bez błędów
