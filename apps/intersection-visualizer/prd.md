# Product Requirements Document (PRD) - Intersection Observer Detector

**Wersja:** 1.0
**Status:** Zatwierdzony do Developmentu (MVP)

## Spis Treści

1.  Słownik Pojęć (Glossary)
2.  Współdzielone Koncepcje (Shared Concepts)
3.  Przegląd Projektu (Project Overview)
4.  Problem Użytkownika (User Problem)
5.  Wymagania Funkcjonalne (Functional Requirements)
6.  Zakres Projektu (Project Scope)
7.  Historyjki Użytkownika (User Stories)
8.  Metryki Sukcesu (Success Metrics)

---

## 1. Słownik Pojęć (Glossary)

- **Intersection Observer API (IO):** Przeglądarkowe API pozwalające kodowi śledzić, kiedy element wchodzi w obszar widoku (viewport).
- **rootMargin:** Wirtualna "strefa buforowa" wokół viewportu. Niewidoczna domyślnie, kluczowa dla poprawnego działania lazy-loadingu.
- **Zombie Observers:** Instancje obserwatorów, które pozostają aktywne w pamięci (Memory Leak), mimo że obserwowany element DOM został usunięty.
- **Evergreen Browsers:** Nowoczesne przeglądarki automatycznie aktualizowane (Chrome, Firefox, Edge, Safari). Ignorujemy wersje starsze i IE11.
- **Hybrid Architecture:** Wzorzec projektowy oddzielający logikę biznesową detekcji (czysty TypeScript) od warstwy prezentacji (Komponenty React), umożliwiający łatwą migrację do Chrome Extension w przyszłości.

## 2. Współdzielone Koncepcje (Shared Concepts)

- **React-First Marketing, Hybrid Engineering:** Sprzedajemy produkt jako bibliotekę Reactową (rozwiązującą problemy developerów tego frameworka), ale kodujemy logikę detekcji ("Core") w czystym TypeScript. React służy wyłącznie jako warstwa UI.
- **Zero Config & High Contrast:** Narzędzie nie posiada panelu ustawień dla użytkownika (MVP). Kolory są "sztywne" (hardcoded) i dobrane tak, by kontrastowały z większością stron internetowych (Neon Green / Magenta).
- **Dev-Mode Only:** Narzędzie działa i inicjalizuje się tylko przy zmiennej środowiskowej `NODE_ENV === 'development'`.
- **Graceful Exit:** Jeśli przeglądarka nie wspiera natywnie `IntersectionObserver` (np. stary Safari), narzędzie po prostu się nie uruchamia (nie crashuje aplikacji, nie ładuje polyfilli).

## 3. Przegląd Projektu (Project Overview)

Projekt "Intersection Observer Detector" to narzędzie deweloperskie (DX Tool), które czyni niewidzialne widocznym. Obecnie deweloperzy implementujący lazy loading pracują "na ślepo", zgadując parametry.

Budujemy wizualny debugger (paczkę Reactową opartą o Hybrid Core), który nakłada na ekran faktyczne strefy `rootMargin`, monitoruje wskaźniki widoczności w czasie rzeczywistym i wyłapuje wycieki pamięci ("Zombie Observers"). Celem jest zamiana godzin debugowania w konsoli na ułamek sekundy wizualnej weryfikacji.

## 4. Problem Użytkownika (User Problem)

Brak wglądu w działanie Intersection Observer API w standardowych DevTools prowadzi do czterech głównych problemów:

- **Praca "na czuja":** Deweloperzy nie widzą wirtualnych stref `rootMargin`, co skutkuje błędami w lazy-loadingu (obrazki ładują się za późno lub za wcześnie).
- **Wycieki pamięci (Zombies):** W aplikacjach SPA (React/Vue) łatwo zostawić nieodłączone observery po odmontowaniu komponentu, co degraduje wydajność.
- **Trudności z animacjami:** Brak podglądu `intersectionRatio` utrudnia precyzyjne zgranie efektów (np. parallax).
- **Chaos 3rd-party:** Trudność w odróżnieniu własnych observerów od tych wstrzykiwanych przez zewnętrzne skrypty (reklamy, analityka).

## 5. Wymagania Funkcjonalne (Functional Requirements)

| ID              | Kategoria   | Opis Wymagania                                                                                                                                  | Priorytet     |
| :-------------- | :---------- | :---------------------------------------------------------------------------------------------------------------------------------------------- | :------------ |
| **FR-ARCH-001** | **CORE**    | System musi być zbudowany w Architekturze Hybrydowej: Logika detekcji (monkey patch) w czystym TS, UI w React.                                  | P0 (Critical) |
| **FR-VIS-002**  | **VISUAL**  | Nakładka `rootMargin` musi używać koloru **Magenta (rgba(255, 0, 255, 0.3))** dla wysokiego kontrastu.                                          | P1            |
| **FR-VIS-003**  | **VISUAL**  | Obszar widoczny elementu (target) musi używać koloru **Neon Green (rgba(0, 255, 0, 0.3))**.                                                     | P1            |
| **FR-VIS-004**  | **VISUAL**  | Linie pomocnicze stref muszą być renderowane jako **Yellow Dashed Lines (2px)**.                                                                | P1            |
| **FR-MON-005**  | **MONITOR** | Panel "Live Monitor" wyświetla aktualny `intersectionRatio` i przekroczone progi (`thresholds`).                                                | P0            |
| **FR-MEM-006**  | **MEMORY**  | Funkcja "Zombie Hunter" oznacza na liście observery, których element docelowy (target) nie istnieje już w DOM.                                  | P0            |
| **FR-COMP-007** | **COMPAT**  | System musi wykrywać obecność natywnego API. Jeśli brak (`!window.IntersectionObserver`), system cicho przerywa działanie.                      | P1            |
| **FR-SAFE-008** | **SAFETY**  | UI narzędzia musi być renderowane w **React Portal**, aby izolować style narzędzia od stylów aplikacji użytkownika (uniknięcie konfliktów CSS). | P0            |

## 6. Zakres Projektu (Project Scope)

### W Zakresie (In Scope for MVP)

- **React Package:** Dystrybucja przez npm jako biblioteka łatwa do wpięcia w Reacta.
- **Modern Browsers Only:** Chrome, Firefox, Edge, Safari (ostatnie 2 wersje major).
- **Hardcoded Visuals:** Brak możliwości zmiany kolorów przez użytkownika (Zero Config).
- **Hybrid Core:** Separacja logiki od widoku (pod kątem przyszłego Chrome Extension).
- **Monkey Patching:** Przechwytywanie globalnego konstruktora `IntersectionObserver`.

### Poza Zakresem (Out of Scope for MVP)

- **Chrome Extension:** Przesunięte do fazy "Skalowanie".
- **Konfiguracja UI:** Żadnych "color pickerów", zmiany motywów czy rozmiarów czcionek.
- **Wsparcie Legacy:** Brak wsparcia dla IE11. Brak obsługi/detekcji polyfilli.
- **SSR Hydration Fixes:** Skomplikowane błędy hydracji zostawiamy na fazę stabilizacji (po MVP).

## 7. Historyjki Użytkownika (User Stories)

**US-DEV-001**

> **Jako** React Developer,
> **Chcę**, aby narzędzie działało od razu po zaimportowaniu komponentu bez żadnej konfiguracji,
> **Ponieważ** nie chcę tracić czasu na ustawianie kolorów czy parametrów debuggera ("Plug & Play").

**US-DEV-002**

> **Jako** Frontend Developer,
> **Chcę** widzieć strefę buforową oznaczoną jaskrawym kolorem (Magenta),
> **Aby** natychmiast zauważyć, czy mój lazy-loading ma poprawne marginesy i nie ładuje zasobów zbyt późno.

**US-PERF-003**

> **Jako** Performance Engineer,
> **Chcę** widzieć listę "Zombie Observers" (odłączonych od DOM),
> **Aby** szybko zidentyfikować i wyeliminować wycieki pamięci w aplikacji SPA.

**US-ARCH-004**

> **Jako** Lead Developer (Planujący przyszłość),
> **Chcę**, aby logika detekcji była technicznie niezależna od Reacta,
> **Aby** w przyszłości łatwo przenieść narzędzie do wtyczki przeglądarkowej bez przepisywania algorytmów.

## 8. Metryki Sukcesu (Success Metrics)

- **Activation Rate:** > 60% sesji deweloperskich z zaimportowanym narzędziem kończy się interakcją z panelem (kliknięcie, inspekcja).
- **Zombie Kill Rate (Value Metric):** Wykrycie przynajmniej jednego "Zombie Observera" lub błędu implementacji w 30% badanych projektów.
- **Zero Config Success:** 100% udanych uruchomień bez konieczności modyfikacji kodu aplikacji (poza importem).
- **Crash-Free Users:** 100% (dzięki izolacji `try-catch` i braku wsparcia dla unstable legacy browsers).

---

### Pytania Wyjaśniające (Clarifying Questions)

- Wszystkie kluczowe decyzje (Hard Decisions) zostały podjęte w fazie definiowania MVP. Brak otwartych pytań blokujących start prac.
