'use client';

/**
 * Fixture H — Intersection Highlight Test
 *
 * Above-the-fold element obserwowany przez IntersectionObserver bez rootMargin
 * i bez threshold. Ponieważ element jest widoczny od razu po załadowaniu strony,
 * isIntersecting = true → overlay powinien pokazać:
 *   - żółta kreskowana ramka (targetRect)
 *   - zielony highlight (intersectionRect) ← to jest główny cel testu
 *
 * Nie ma rootMargin → magenta strefa NIE powinna się pojawić.
 */

import { useEffect, useRef } from 'react';

export function IntersectionTestBox() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) =>
          console.debug(
            '[IO-Fixture H] intersection ratio:',
            e.intersectionRatio,
            'isIntersecting:',
            e.isIntersecting,
          ),
        ),
      // brak rootMargin i threshold → czyste intersection, bez magenty
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="fixed top-16 right-4 z-40 w-64 p-3 border border-cyan-500/40 rounded-lg bg-cyan-950/30 backdrop-blur-sm pointer-events-none"
    >
      <p className="text-cyan-400 font-mono text-xs font-semibold">
        H · Intersection Test (above fold)
      </p>
      <p className="text-cyan-300/60 text-xs mt-1 leading-relaxed">
        Ten element jest od razu obserwowany.
        <br />
        Overlay powinien pokazać:
        <br />
        <span className="text-yellow-400">━ ━ żółta ramka</span> (targetRect)
        <br />
        <span className="text-green-400">█ zielone wypełnienie</span>{' '}
        (intersectionRect)
        <br />
        <span className="text-neutral-500">brak magenty</span> (rootMargin = 0)
      </p>
    </div>
  );
}
