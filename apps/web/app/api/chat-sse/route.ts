/**
 * API Route: /api/chat-sse
 *
 * Symuluje streaming odpowiedzi AI przez Server-Sent Events (SSE).
 * Każde słowo jest wysyłane osobno z opóźnieniem, co naśladuje
 * zachowanie np. OpenAI streaming API.
 *
 * SSE to jednokierunkowy kanał: serwer -> klient.
 * Format: "data: <payload>\n\n"
 */

import { NextRequest } from 'next/server';

const RESPONSES: Record<string, string> = {
  default:
    'Cześć! Jestem asystentem AI. Mogę pomóc Ci zrozumieć RxJS i programowanie reaktywne. Zapytaj mnie o cokolwiek!',
  rxjs: 'RxJS to biblioteka do programowania reaktywnego oparta na Observables. Kluczowe koncepty to: Observable (strumień danych), Observer (subskrybent), Operators (transformacje) i Subscription (zarządzanie cyklem życia).',
  switchmap:
    'switchMap to operator który anuluje poprzednie wewnętrzne Observable gdy pojawia się nowe zdarzenie. Idealny do wyszukiwarki lub requestów HTTP gdzie interesuje nas tylko ostatnie zapytanie.',
  takeuntil:
    'takeUntil(notifier$) kończy Observable gdy notifier$ wyemituje wartość. Używaj go do czyszczenia subskrypcji przy unmount komponentu React: takeUntil(destroy$) gdzie destroy$.next() wywołujesz w useEffect cleanup.',
  observable:
    'Observable to leniwy strumień danych który produkuje wartości w czasie. Różni się od Promise tym, że może emitować wiele wartości, jest anulowany i nic nie robi dopóki ktoś się nie zasubskrybuje.',
};

function getResponse(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('switchmap') || lower.includes('switch')) {
    return RESPONSES.switchmap!;
  }
  if (lower.includes('takeuntil') || lower.includes('take')) {
    return RESPONSES.takeuntil!;
  }
  if (lower.includes('observable')) {
    return RESPONSES.observable!;
  }
  if (lower.includes('rxjs') || lower.includes('reaktywn')) {
    return RESPONSES.rxjs!;
  }
  return RESPONSES.default!;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const message = searchParams.get('message') ?? '';

  const responseText = getResponse(message);
  const words = responseText.split(' ');

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // Wysyłamy każde słowo jako osobne zdarzenie SSE
      for (const word of words) {
        // Sprawdzamy czy klient nie rozłączył się (AbortSignal)
        if (request.signal.aborted) {
          controller.close();
          return;
        }

        // Format SSE: "data: <json>\n\n"
        const payload = JSON.stringify({ word: word + ' ', done: false });
        controller.enqueue(encoder.encode(`data: ${payload}\n\n`));

        // Sztuczne opóźnienie symulujące "myślenie" AI
        await new Promise((resolve) =>
          setTimeout(resolve, 80 + Math.random() * 60),
        );
      }

      // Sygnał końca streamu
      const donePayload = JSON.stringify({ word: '', done: true });
      controller.enqueue(encoder.encode(`data: ${donePayload}\n\n`));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      // CORS dla local dev
      'Access-Control-Allow-Origin': '*',
    },
  });
}
