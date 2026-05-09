import { RxjsChat } from '../components/rxjs-chat/RxjsChat';

export default function RxjsChatPage() {
  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-purple-400">
          RxJS Chat — Playground
        </h1>
        <p className="text-gray-400 mb-2 text-sm">
          Demonstracja: <code className="text-purple-300">switchMap</code> •{' '}
          <code className="text-purple-300">takeUntil</code> •{' '}
          <code className="text-purple-300">SSE streaming</code> •{' '}
          <code className="text-purple-300">animacje</code>
        </p>
        <a
          href="/rxjs-playground"
          className="text-xs text-purple-400 hover:text-purple-300 underline underline-offset-2 transition-colors mb-6 inline-block"
        >
          ← Wróć do playgroundu (operatory osobno)
        </a>
        <RxjsChat />
      </div>
    </main>
  );
}
