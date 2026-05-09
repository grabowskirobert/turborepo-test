'use client';

/**
 * useChat — hook zarządzający logiką chatu za pomocą RxJS
 *
 * ARCHITEKTURA RXJS:
 * - RxJS definiuje KIEDY i W JAKIEJ KOLEJNOŚCI coś się dzieje (orkiestracja)
 * - Funkcje wewnątrz operatorów realizują CO konkretnie ma się stać
 *
 * FLOW:
 * send$ (Subject) --> switchMap(fetchSSE) --> takeUntil(stop$ | destroy$)
 *                                          --> aktualizacja stanu
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  Subject,
  Observable,
  fromEvent,
  EMPTY,
  merge,
  animationFrameScheduler,
} from 'rxjs';
import {
  switchMap,
  takeUntil,
  tap,
  finalize,
  observeOn,
  scan,
} from 'rxjs/operators';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  streaming?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILITY: Tworzy Observable ze strumienia SSE
//
// fromEventSource() jest naszą własną funkcją bo RxJS nie ma wbudowanego
// operatora dla EventSource. To dobry przykład jak "opakować" dowolne async API
// w Observable.
// ─────────────────────────────────────────────────────────────────────────────
function fromEventSource(
  url: string,
): Observable<{ word: string; done: boolean }> {
  return new Observable((observer) => {
    const es = new EventSource(url);

    // Każde zdarzenie SSE trafia do strumienia
    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as { word: string; done: boolean };
        observer.next(data);

        if (data.done) {
          observer.complete();
          es.close();
        }
      } catch {
        observer.error(new Error('SSE parse error'));
        es.close();
      }
    };

    es.onerror = (err) => {
      observer.error(err);
      es.close();
    };

    // KLUCZOWE: funkcja cleanup wywoływana przy anulowaniu Observable
    // (np. przez switchMap gdy przyjdzie nowe zapytanie, albo przez takeUntil)
    return () => {
      es.close();
    };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// HOOK
// ─────────────────────────────────────────────────────────────────────────────
export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [typingDots, setTypingDots] = useState(0);
  // Licznik anulowań przez switchMap — rośnie gdy nowa wiadomość przerwie poprzednią
  const [cancelledCount, setCancelledCount] = useState(0);

  // Subject to gorący Observable — możemy ręcznie push-ować wartości.
  // send$ emituje gdy użytkownik wyśle wiadomość.
  const send$ = useRef(new Subject<string>());

  // stop$ emituje gdy użytkownik kliknie "Stop" — anuluje bieżące streaming
  const stop$ = useRef(new Subject<void>());

  // destroy$ emituje przy unmount komponentu — czyści WSZYSTKIE subskrypcje
  const destroy$ = useRef(new Subject<void>());

  useEffect(() => {
    // Animacja "..." podczas oczekiwania na pierwsze słowo
    // observeOn(animationFrameScheduler) — synchronizuje aktualizacje stanu
    // z cyklem renderowania przeglądarki (requestAnimationFrame)
    const typingAnimation$ = new Observable<number>((observer) => {
      let count = 0;
      const interval = setInterval(() => {
        observer.next(count % 4);
        count++;
      }, 400);
      return () => clearInterval(interval);
    });

    const animSub = typingAnimation$
      .pipe(
        // Reagujemy na zmiany isStreaming przez osobny mechanizm
        observeOn(animationFrameScheduler),
        takeUntil(destroy$.current),
      )
      .subscribe((dots) => setTypingDots(dots));

    // ─────────────────────────────────────────────────────────────────────
    // GŁÓWNY PIPELINE
    //
    // send$  — Subject który emituje tekst wiadomości użytkownika
    //   │
    //   └─► switchMap(message => fetchSSE(message))
    //         │
    //         │  switchMap ANULUJE poprzedni wewnętrzny Observable
    //         │  gdy send$ wyemituje nową wartość.
    //         │  To rozwiązuje RACE CONDITION: jeśli użytkownik wyśle
    //         │  dwie wiadomości szybko, pierwsza odpowiedź jest porzucana.
    //         │
    //         └─► takeUntil(merge(stop$, destroy$))
    //               │
    //               │  takeUntil kończy strumień gdy stop$ (klik "Stop")
    //               │  lub destroy$ (unmount) wyemitują wartość.
    //               │  To DEKLARATYWNE ANULOWANIE — logika anulowania
    //               │  jest zakodowana w strukturze strumienia, nie w if-ach.
    //               │
    //               └─► scan() — akumuluje słowa w jeden tekst odpowiedzi
    // ─────────────────────────────────────────────────────────────────────
    const sub = send$.current
      .pipe(
        tap((message) => {
          // TAP to "side effect" operator — nie zmienia strumienia,
          // tylko pozwala wykonać akcję (np. aktualizację UI)
          //
          // Jeśli streaming był aktywny gdy przyszła nowa wiadomość,
          // switchMap zaraz anuluje poprzedni stream — liczymy to jako "cancelled"
          setIsStreaming((prev) => {
            if (prev) setCancelledCount((c) => c + 1);
            return true;
          });
          setMessages((prev) => [
            ...prev,
            { id: Date.now().toString(), role: 'user', text: message },
            {
              id: (Date.now() + 1).toString(),
              role: 'assistant',
              text: '',
              streaming: true,
            },
          ]);
        }),

        switchMap((message) => {
          const url = `/api/chat-sse?message=${encodeURIComponent(message)}`;

          return fromEventSource(url).pipe(
            // takeUntil WEWNĄTRZ switchMap — anuluje tylko aktywny SSE stream
            // gdy użytkownik kliknie Stop (stop$) lub komponent się odmontuje (destroy$)
            takeUntil(merge(stop$.current, destroy$.current)),

            // scan akumuluje słowa → pełen tekst odpowiedzi
            // To jak Array.reduce ale dla strumieni wartości w czasie
            scan((acc, event) => acc + event.word, ''),

            tap((accumulatedText) => {
              // Aktualizujemy ostatnią wiadomość asystenta w czasie rzeczywistym
              setMessages((prev) => {
                const updated = [...prev];
                const lastIdx = updated.length - 1;
                if (updated[lastIdx]?.role === 'assistant') {
                  updated[lastIdx] = {
                    ...updated[lastIdx]!,
                    text: accumulatedText,
                    streaming: true,
                  };
                }
                return updated;
              });
            }),

            finalize(() => {
              // finalize działa jak finally w try/catch
              // Wywoływany zawsze: po complete(), error() i po anulowaniu
              setIsStreaming(false);
              setMessages((prev) => {
                const updated = [...prev];
                const lastIdx = updated.length - 1;
                if (updated[lastIdx]?.role === 'assistant') {
                  updated[lastIdx] = {
                    ...updated[lastIdx]!,
                    streaming: false,
                  };
                }
                return updated;
              });
            }),
          );
        }),

        takeUntil(destroy$.current),
      )
      .subscribe();

    return () => {
      // Cleanup przy unmount: destroy$ sygnalizuje wszystkim takeUntil
      destroy$.current.next();
      destroy$.current.complete();
      sub.unsubscribe();
      animSub.unsubscribe();
    };
  }, []);

  const sendMessage = useCallback((text: string) => {
    if (text.trim()) {
      send$.current.next(text);
    }
  }, []);

  const stopStreaming = useCallback(() => {
    stop$.current.next();
  }, []);

  const clearChat = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isStreaming,
    typingDots,
    cancelledCount,
    sendMessage,
    stopStreaming,
    clearChat,
  };
}
