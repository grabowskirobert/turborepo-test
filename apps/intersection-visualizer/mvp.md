# Definicja MVP: Detektor Intersection Observer

## 1. Zdefiniowanie Problemu (Problem Statement)

Narzędzia developerskie w przeglądarkach nie oferują wystarczającego wglądu w działanie Intersection Observer API, co prowadzi do:

- **"Magia" rootMargin:** Deweloperzy pracują "na ślepo", nie widząc wirtualnych stref buforowych, co skutkuje błędami w lazy loadingu.
- **Niejasności progów (thresholds):** Brak precyzyjnych danych o `intersectionRatio` utrudnia płynne zgranie animacji (np. parallax).
- **"Zombie Observers" (Memory Leaks):** Trudność w wykryciu nieodłączonych observerów w SPA (React/Vue), co prowadzi do wycieków pamięci.
- **Brak kontroli nad skryptami 3rd-party:** Niemożność łatwego audytu observerów wstrzykiwanych przez reklamy i analitykę.

## 2. Grupa Docelowa i Wcześni Adopterzy (Target Audience)

- **Główni użytkownicy:** Frontend Developers (Mid/Senior) pracujący z nowoczesnymi frameworkami.
- **Early Adopters:**
  - **Performance Engineers:** Skupieni na wydajności, szukający wycieków pamięci (walka z "Zombie Observers").
  - **Creative Developers:** Tworzący zaawansowane animacje, potrzebujący precyzyjnej wizualizacji.

## 3. Propozycja Wartości (Value Proposition)

Przekształcamy niewidzialną, abstrakcyjną logikę Intersection Observera w czytelną warstwę wizualną, którą programista może zrozumieć i zdiagnozować w ułamku sekundy, eliminując zgadywanie i żmudne debugowanie konsolą.

## 4. Kluczowe Funkcje (Core Features - The "Minimum")

- **Wizualizacja rootMargin (Visualizer):** Nakładka (overlay) rysująca fizyczne ramki stref buforowych.
- **Live Thresholds & Ratio Monitor:** Panel wyświetlający w czasie rzeczywistym `intersectionRatio` i przekroczone progi.
- **Panel "Zombie Hunter" (Lista Observerów):** Lista aktywnych instancji, oznaczająca observery, których elementy docelowe zostały usunięte z DOM (wycieki pamięci).
- **Detekcja źródeł (3rd-party Filter):** Oznaczanie pochodzenia observera (np. "Twój kod" vs "Google Ads").

## 5. "Measure" - Kluczowe Mierniki Sukcesu (Privacy First)

- **Zasada:** Działa tylko w `NODE_ENV === 'development'`, telemetria jest całkowicie **Opt-in**.
- **Metryka "Aha! Moment" (Activation Rate):** % sesji z wykrytym > 0 observerem.
- **Metryka "Detekcji Anomalii" (Value Metric):** Liczba wyświetlonych ostrzeżeń (Warnings Triggered) o błędach w implementacji.
- **Wizualna Interakcja:** Częstotliwość używania funkcji podświetlania i nakładek (Toggle Rate).

## 6. "Learn" - Plan Zbierania Feedbacku

- **Strategia "Frictionless Feedback":** Przycisk w interfejsie generujący inteligentne linki do GitHub Issues.
- **Automatyzacja:** Linki URL automatycznie wypełniają szablon zgłoszenia danymi technicznymi (wersja, środowisko, błąd), aby maksymalnie ułatwić zgłaszanie bugów.

## 7. Założenia i Ryzyka (Assumptions & Risks)

- **Ryzyko Stabilności (Monkey Patching):**
  - _Mitygacja:_ Użycie wzorca **Proxy**, architektura "Host Priority" (try...catch połykający błędy narzędzia).
- **Ryzyko Wydajności (Zasada Heisenberga):**
  - _Mitygacja:_ UI w **React Portal**, wizualizacja oparta o `transform/opacity` (GPU), throttling aktualizacji (max 30fps).
- **Ryzyko Adopcji (UX vs console.log):**
  - _Mitygacja:_ Filozofia **"Zero Config"** (prosty import, brak skomplikowanych providerów).

## 8. Wizja Przyszłości (Post-MVP)

**Krok 1: Faza "Stabilizacja" (React Library)**

- _Czas:_ 1-2 miesiące po premierze.
- _Cel:_ Wyeliminować "False Positives".
- _Działanie:_ Naprawa konfliktów brzegowych (iframes, Next.js, SSR hydration mismatch) przed dodawaniem nowych funkcji. Utrzymanie czystości algorytmu (Core Logic).

**Krok 2: Faza "Skalowanie" (Chrome Extension)**

- _Czas:_ Dopiero po ustabilizowaniu biblioteki.
- _Cel:_ Dotarcie do użytkowników spoza ekosystemu React.
- _Strategia:_ Opakowanie sprawdzonej Core Logic w format rozszerzenia przeglądarki. Pozwala to na debugowanie dowolnej strony bez ingerencji w kod źródłowy projektu.
