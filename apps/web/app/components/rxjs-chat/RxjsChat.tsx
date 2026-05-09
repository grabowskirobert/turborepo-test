'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { useChat } from './useChat';

// ─────────────────────────────────────────────────────────────────────────────
// Komponenty prezentacyjne (bez logiki RxJS — to jest w useChat.ts)
// ─────────────────────────────────────────────────────────────────────────────

function TypingIndicator({ dots }: { dots: number }) {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      <span className="text-gray-500 text-sm mr-1">AI pisze</span>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-2 h-2 rounded-full bg-purple-500 transition-opacity duration-200"
          style={{ opacity: i < dots ? 1 : 0.2 }}
        />
      ))}
    </div>
  );
}

function MessageBubble({
  role,
  text,
  streaming,
}: {
  role: 'user' | 'assistant';
  text: string;
  streaming?: boolean;
}) {
  const isUser = role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div
        className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? 'bg-purple-600 text-white rounded-br-sm'
            : 'bg-gray-800 text-gray-100 rounded-bl-sm'
        }`}
      >
        {text}
        {/* Kursor migający podczas streamingu */}
        {streaming && !isUser && (
          <span className="inline-block w-0.5 h-4 bg-purple-400 ml-0.5 animate-pulse align-middle" />
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// OPERATOR LEGEND — wyjaśnienie użytych operatorów RxJS
// ─────────────────────────────────────────────────────────────────────────────
function OperatorLegend() {
  const operators = [
    {
      name: 'switchMap',
      color: 'text-blue-400',
      desc: 'Anuluje poprzedni request gdy przyjdzie nowy. Race condition solved.',
    },
    {
      name: 'takeUntil',
      color: 'text-green-400',
      desc: 'Kończy strumień gdy notifier$ emituje. Używany przy Stop i unmount.',
    },
    {
      name: 'scan',
      color: 'text-yellow-400',
      desc: 'Akumuluje wartości strumienia. Jak reduce() ale w czasie.',
    },
    {
      name: 'tap',
      color: 'text-orange-400',
      desc: 'Side-effect bez zmiany strumienia. Do logowania i aktualizacji UI.',
    },
    {
      name: 'finalize',
      color: 'text-red-400',
      desc: 'Jak finally — działa po complete(), error() i anulowaniu.',
    },
    {
      name: 'Subject',
      color: 'text-purple-400',
      desc: 'Gorący Observable — możesz push-ować wartości ręcznie (.next()).',
    },
  ];

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-4">
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
        Użyte operatory RxJS
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {operators.map((op) => (
          <div key={op.name} className="flex gap-2">
            <code className={`text-sm font-mono shrink-0 ${op.color}`}>
              {op.name}
            </code>
            <span className="text-xs text-gray-500 leading-tight">
              {op.desc}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export function RxjsChat() {
  const {
    messages,
    isStreaming,
    typingDots,
    cancelledCount,
    sendMessage,
    stopStreaming,
    clearChat,
  } = useChat();
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll do ostatniej wiadomości
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input.trim());
    setInput('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestions = [
    'Co to jest RxJS?',
    'Wytłumacz switchMap',
    'Jak działa takeUntil?',
    'Co to jest Observable?',
  ];

  return (
    <div className="flex flex-col gap-4">
      <OperatorLegend />

      {/* Okno chatu */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl flex flex-col h-[500px]">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center gap-4">
              <p className="text-gray-600 text-sm">
                Zadaj pytanie o RxJS lub kliknij sugestię
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs rounded-full transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <MessageBubble key={msg.id} {...msg} />
          ))}

          {isStreaming && messages[messages.length - 1]?.role === 'user' && (
            <TypingIndicator dots={typingDots} />
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-800 p-3 flex gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isStreaming
                ? 'Wyślij nowe pytanie → switchMap anuluje poprzednie...'
                : 'Wpisz pytanie o RxJS...'
            }
            className="flex-1 bg-gray-800 text-gray-100 placeholder-gray-500 rounded-lg px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-purple-500"
          />

          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white text-sm rounded-lg transition-colors font-medium"
          >
            Wyślij
          </button>

          {isStreaming && (
            <button
              onClick={stopStreaming}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm rounded-lg transition-colors font-medium"
            >
              Stop
            </button>
          )}

          {messages.length > 0 && !isStreaming && (
            <button
              onClick={clearChat}
              className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-400 text-sm rounded-lg transition-colors"
              title="Wyczyść czat"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Debug info — pokazuje aktualny stan RxJS */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Stan RxJS
        </h3>
        <div className="flex gap-4 text-xs font-mono">
          <span>
            <span className="text-gray-600">send$.next():</span>{' '}
            <span className="text-purple-400">
              {messages.filter((m) => m.role === 'user').length}x
            </span>
          </span>
          <span>
            <span className="text-gray-600">streaming:</span>{' '}
            <span className={isStreaming ? 'text-green-400' : 'text-gray-500'}>
              {isStreaming ? 'true ←SSE aktywne' : 'false'}
            </span>
          </span>
          <span>
            <span className="text-gray-600">switchMap cancelled:</span>{' '}
            <span
              className={
                cancelledCount > 0 ? 'text-yellow-400' : 'text-gray-500'
              }
            >
              {cancelledCount > 0
                ? `${cancelledCount}x ← race condition złapany!`
                : '0'}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
