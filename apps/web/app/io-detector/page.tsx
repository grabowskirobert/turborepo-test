import Link from 'next/link';
import { FadeInSection } from '../components/FadeInSection';
import { IODebugFixtures } from '../components/IODebugFixtures';
import { IntersectionTestBox } from '../components/IntersectionTestBox';

export default function IODetectorPage() {
  return (
    <>
      <IntersectionTestBox />
      <main className="flex flex-col items-center justify-between min-h-screen p-24">
        <div className="w-full max-w-5xl">
          <Link
            href="/"
            className="text-xs text-gray-600 hover:text-gray-400 transition-colors mb-8 inline-block"
          >
            ← Strona główna
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">IO Detector</h1>
          <p className="text-gray-500 text-sm mb-12">
            Scenariusze testowe dla{' '}
            <code className="text-green-400">@repo/io-detector</code> —
            Intersection Observer.
          </p>
        </div>

        <FadeInSection threshold={0.2} delay={200}>
          <div className="w-full max-w-5xl">
            <IODebugFixtures />
          </div>
        </FadeInSection>
      </main>
    </>
  );
}
