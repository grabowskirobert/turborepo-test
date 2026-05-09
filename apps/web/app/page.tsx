const ROUTES = [
  {
    href: '/rxjs-playground',
    label: 'RxJS Playground',
    description:
      'Interaktywne dema operatorów: Subject, switchMap, takeUntil, scan, debounceTime, merge.',
    tag: 'nauka',
    tagColor: 'text-purple-400 bg-purple-400/10',
  },
  {
    href: '/rxjs-chat',
    label: 'RxJS Chat',
    description:
      'Chat streamowany przez SSE — switchMap, takeUntil i animacje w jednym scenariuszu.',
    tag: 'demo',
    tagColor: 'text-blue-400 bg-blue-400/10',
  },
  {
    href: '/io-detector',
    label: 'IO Detector',
    description:
      'Testy i scenariusze dla paczki @repo/io-detector — Intersection Observer.',
    tag: 'dev',
    tagColor: 'text-green-400 bg-green-400/10',
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 flex flex-col items-center justify-center p-8">
      <div className="max-w-3xl w-full">
        <h1 className="text-4xl font-bold text-white mb-2">Turborepo</h1>
        <p className="text-gray-500 mb-12 text-sm">
          Wybierz sekcję do której chcesz przejść.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ROUTES.map((route) => (
            <a
              key={route.href}
              href={route.href}
              className="group flex flex-col gap-3 p-5 bg-gray-900 border border-gray-800 rounded-xl hover:border-gray-600 hover:bg-gray-800/80 transition-all duration-150"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white text-sm group-hover:text-purple-300 transition-colors">
                  {route.label}
                </span>
                <span
                  className={`text-xs font-mono px-2 py-0.5 rounded-full ${route.tagColor}`}
                >
                  {route.tag}
                </span>
              </div>
              <p className="text-gray-500 text-xs leading-relaxed">
                {route.description}
              </p>
              <span className="text-gray-700 text-xs group-hover:text-gray-400 transition-colors mt-auto">
                {route.href} →
              </span>
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
