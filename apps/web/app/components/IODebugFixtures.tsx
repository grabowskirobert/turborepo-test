'use client';

/**
 * IO Debug Fixtures
 *
 * Mockowe scenariusze IntersectionObserver do testowania IODetector panel.
 *
 * Scenariusze:
 *   A — Named callback function   → "handleHeroReveal"
 *   B — data-io-name attribute     → "ProductGallery"
 *   C — Homogeneous <img> group    → "Observer (<img>)" + thumbnails
 *   D — background-image target    → thumbnail via CSS extraction
 *   E — Heterogeneous mixed        → "Anonymous Observer #N"
 *   F — Large rootMargin (300px)   → element off-screen ale już "widoczny"
 *   G — Zombie simulation button   → 💀 czerwony wiersz po ~5s
 */

import { useEffect, useRef, useState } from 'react';

export function IODebugFixtures() {
  // ── Refs for observed elements ─────────────────────────────────────────
  const heroRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const img1Ref = useRef<HTMLImageElement>(null);
  const img2Ref = useRef<HTMLImageElement>(null);
  const img3Ref = useRef<HTMLImageElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const mixedDivRef = useRef<HTMLDivElement>(null);
  const mixedImgRef = useRef<HTMLImageElement>(null);
  const farBelowRef = useRef<HTMLDivElement>(null);

  const [zombieCount, setZombieCount] = useState(0);

  useEffect(() => {
    const active: IntersectionObserver[] = [];

    // ── A: Named callback ─────────────────────────────────────────────────
    function handleHeroReveal(entries: IntersectionObserverEntry[]) {
      entries.forEach((e) =>
        console.debug(
          '[IO-Fixture A] handleHeroReveal ratio:',
          e.intersectionRatio,
        ),
      );
    }
    if (heroRef.current) {
      const obs = new IntersectionObserver(handleHeroReveal, {
        threshold: [0, 0.25, 0.5, 0.75, 1],
      });
      obs.observe(heroRef.current);
      active.push(obs);
    }

    // ── B: data-io-name ───────────────────────────────────────────────────
    if (galleryRef.current) {
      const obs = new IntersectionObserver(
        (entries) =>
          entries.forEach((e) =>
            console.debug(
              '[IO-Fixture B] ProductGallery ratio:',
              e.intersectionRatio,
            ),
          ),
        { rootMargin: '50px 0px' },
      );
      obs.observe(galleryRef.current);
      active.push(obs);
    }

    // ── C: Homogeneous <img> (single observer, 3 targets) ─────────────────
    const imgRefs = [img1Ref, img2Ref, img3Ref];
    if (imgRefs.every((r) => r.current)) {
      const obs = new IntersectionObserver(
        (entries) =>
          entries.forEach((e) =>
            console.debug(
              '[IO-Fixture C] img-group ratio:',
              e.intersectionRatio,
            ),
          ),
        { threshold: 0.5 },
      );
      imgRefs.forEach((r) => obs.observe(r.current!));
      active.push(obs);
    }

    // ── D: background-image div ───────────────────────────────────────────
    if (bgRef.current) {
      const obs = new IntersectionObserver((entries) =>
        entries.forEach((e) =>
          console.debug('[IO-Fixture D] bg-image ratio:', e.intersectionRatio),
        ),
      );
      obs.observe(bgRef.current);
      active.push(obs);
    }

    // ── E: Anonymous mixed (div + img → heterogeneous → fallback name) ────
    if (mixedDivRef.current && mixedImgRef.current) {
      const obs = new IntersectionObserver(
        (entries) =>
          entries.forEach((e) =>
            console.debug('[IO-Fixture E] mixed ratio:', e.intersectionRatio),
          ),
        { threshold: [0, 0.5, 1] },
      );
      obs.observe(mixedDivRef.current);
      obs.observe(mixedImgRef.current);
      active.push(obs);
    }

    // ── F: Large rootMargin — wykrywa element zanim wejdzie w viewport ────
    if (farBelowRef.current) {
      const obs = new IntersectionObserver(
        (entries) =>
          entries.forEach((e) =>
            console.debug(
              '[IO-Fixture F] far-below ratio:',
              e.intersectionRatio,
            ),
          ),
        { rootMargin: '300px 0px' },
      );
      obs.observe(farBelowRef.current);
      active.push(obs);
    }

    return () => active.forEach((o) => o.disconnect());
  }, []);

  // ── G: Zombie spawner ──────────────────────────────────────────────────
  function spawnZombie() {
    const ghost = document.createElement('div');
    ghost.style.cssText =
      'position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;top:0;left:0;';
    document.body.appendChild(ghost);

    function handleZombieTarget(entries: IntersectionObserverEntry[]) {
      entries.forEach((e) =>
        console.debug('[IO-Fixture G] zombie ratio:', e.intersectionRatio),
      );
    }
    const obs = new IntersectionObserver(handleZombieTarget);
    obs.observe(ghost);

    // Odłącz element od DOM po 500ms — observer zostaje aktywny → Zombie
    setTimeout(() => {
      ghost.remove();
      setZombieCount((c) => c + 1);
    }, 500);
  }

  return (
    <section className="w-full max-w-5xl mt-24 space-y-10">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border border-purple-500/30 rounded-lg bg-purple-950/20">
        <span className="text-purple-400 text-lg">🔬</span>
        <div>
          <p className="text-purple-300 font-mono text-sm font-semibold">
            IO Debug Fixtures
          </p>
          <p className="text-purple-400/70 text-xs mt-0.5">
            Otwórz IO Detector panel (prawy dolny róg) → klikaj wiersze grup
          </p>
        </div>
      </div>

      {/* ── A: Named function ─────────────────────────────────────────── */}
      <div
        ref={heroRef}
        className="p-8 border rounded-lg border-blue-500/30 bg-blue-950/20"
      >
        <p className="text-xs text-blue-400/80 font-mono mb-3">
          A · Named callback:{' '}
          <strong className="text-blue-300">handleHeroReveal</strong> ·
          threshold [0, 0.25, 0.5, 0.75, 1]
        </p>
        <h3 className="text-xl font-bold text-white">Hero Section</h3>
        <p className="text-neutral-400 text-sm mt-2">
          Callback ma nazwę → Panel wyświetli:{' '}
          <code className="text-blue-300 bg-blue-950/50 px-1 rounded">
            handleHeroReveal
          </code>
        </p>
      </div>

      {/* ── B: data-io-name ───────────────────────────────────────────── */}
      <div
        ref={galleryRef}
        data-io-name="ProductGallery"
        className="p-8 border rounded-lg border-green-500/30 bg-green-950/20"
      >
        <p className="text-xs text-green-400/80 font-mono mb-3">
          B ·{' '}
          <strong className="text-green-300">
            data-io-name=&quot;ProductGallery&quot;
          </strong>{' '}
          · rootMargin: 50px
        </p>
        <h3 className="text-xl font-bold text-white">Product Gallery</h3>
        <p className="text-neutral-400 text-sm mt-2">
          Atrybut na elemencie → Panel wyświetli:{' '}
          <code className="text-green-300 bg-green-950/50 px-1 rounded">
            ProductGallery
          </code>
        </p>
      </div>

      {/* ── C: Homogeneous <img> ──────────────────────────────────────── */}
      <div className="p-8 border rounded-lg border-yellow-500/30 bg-yellow-950/20">
        <p className="text-xs text-yellow-400/80 font-mono mb-3">
          C · Homogeneous{' '}
          <strong className="text-yellow-300">&lt;img&gt;</strong> · 1 observer
          · 3 targets · threshold: 0.5
        </p>
        <h3 className="text-xl font-bold text-white mb-4">Image Group</h3>
        <div className="flex gap-4 flex-wrap">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={img1Ref}
            src="/next.svg"
            alt="Next.js"
            className="w-24 h-24 object-contain bg-white/10 rounded-lg p-3"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={img2Ref}
            src="/turborepo.svg"
            alt="Turborepo"
            className="w-24 h-24 object-contain bg-white/10 rounded-lg p-3"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={img3Ref}
            src="/vercel.svg"
            alt="Vercel"
            className="w-24 h-24 object-contain bg-white/10 rounded-lg p-3"
          />
        </div>
        <p className="text-neutral-400 text-sm mt-4">
          Wszystkie targets to{' '}
          <code className="text-yellow-300">&lt;img&gt;</code> → Panel:{' '}
          <code className="text-yellow-300 bg-yellow-950/50 px-1 rounded">
            Observer (&lt;img&gt;)
          </code>{' '}
          + 3 thumbnails
        </p>
      </div>

      {/* ── D: background-image ───────────────────────────────────────── */}
      <div className="p-8 border rounded-lg border-orange-500/30 bg-orange-950/20">
        <p className="text-xs text-orange-400/80 font-mono mb-3">
          D · <strong className="text-orange-300">background-image</strong>{' '}
          target · thumbnail via getComputedStyle
        </p>
        <h3 className="text-xl font-bold text-white mb-4">
          Background Image Thumbnail
        </h3>
        <div className="flex gap-6 items-start">
          <div
            ref={bgRef}
            style={{
              backgroundImage: 'url(/circles.svg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
            className="w-32 h-32 rounded-lg border border-orange-500/30 shrink-0"
          />
          <p className="text-neutral-400 text-sm">
            Element nie jest <code>&lt;img&gt;</code>, ale ma{' '}
            <code className="text-orange-300">background-image</code> →
            Thumbnail wyciągany przez{' '}
            <code className="text-orange-300">getComputedStyle</code> + regex{' '}
            <code>/url\(&quot;?(.+?)&quot;?\)/</code>
          </p>
        </div>
      </div>

      {/* ── E: Anonymous mixed ────────────────────────────────────────── */}
      <div className="p-8 border rounded-lg border-neutral-500/30 bg-neutral-900/40">
        <p className="text-xs text-neutral-400 font-mono mb-3">
          E · Anonymous ·{' '}
          <strong className="text-neutral-300">mieszane tagi</strong> (div +
          img) · fallback naming
        </p>
        <h3 className="text-xl font-bold text-white mb-4">Mixed Observer</h3>
        <div className="flex gap-4 items-center">
          <div
            ref={mixedDivRef}
            className="w-24 h-24 bg-neutral-700/60 rounded-lg flex items-center justify-center text-xs text-neutral-400 border border-neutral-600"
          >
            &lt;div&gt;
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={mixedImgRef}
            src="/vercel.svg"
            alt="vercel"
            className="w-24 h-24 object-contain bg-white/10 rounded-lg p-3"
          />
        </div>
        <p className="text-neutral-400 text-sm mt-4">
          Heterogeneous targets (div + img) → żaden Tag Inference nie pasuje →
          Panel:{' '}
          <code className="text-neutral-300 bg-neutral-800 px-1 rounded">
            Anonymous Observer #N
          </code>
        </p>
      </div>

      {/* ── G: Zombie spawner ─────────────────────────────────────────── */}
      <div className="p-8 border rounded-lg border-red-500/30 bg-red-950/20">
        <p className="text-xs text-red-400/80 font-mono mb-3">
          G · <strong className="text-red-300">Zombie simulation</strong> ·
          element usuwany po 500ms · named callback
        </p>
        <h3 className="text-xl font-bold text-white mb-2">
          Zombie Hunter Test
        </h3>
        <p className="text-neutral-400 text-sm mb-5">
          Tworzy observer na ukrytym elemencie → usuwa element po 500ms →
          observer zostaje aktywny. Zombie Poller wykrywa po ~5s i zmienia tło
          wiersza na czerwone.
        </p>
        <div className="flex gap-4 items-center flex-wrap">
          <button
            onClick={spawnZombie}
            className="px-5 py-2.5 bg-red-900/40 border border-red-500/60 rounded-lg text-red-300 text-sm font-mono font-semibold hover:bg-red-900/70 active:scale-95 transition-all"
          >
            💀 Spawn Zombie
          </button>
          {zombieCount > 0 && (
            <span className="text-red-400 text-sm font-mono">
              Spawned: {zombieCount} · poczekaj ~5s → panel pokaże wiersz z 🔗💥
              i przyciskiem &quot;Force Stop&quot;
            </span>
          )}
        </div>
      </div>

      {/* ── F: Far below + rootMargin ─────────────────────────────────── */}
      <div className="pt-32 pb-24">
        <div
          ref={farBelowRef}
          className="p-8 border rounded-lg border-violet-500/30 bg-violet-950/20"
        >
          <p className="text-xs text-violet-400/80 font-mono mb-3">
            F ·{' '}
            <strong className="text-violet-300">
              rootMargin: &quot;300px 0px&quot;
            </strong>{' '}
            · element był &quot;widoczny&quot; zanim tu doscrollowałeś
          </p>
          <h3 className="text-xl font-bold text-white">Off-screen Section</h3>
          <p className="text-neutral-400 text-sm mt-2">
            rootMargin rozszerza strefę detekcji o 300px w górę i dół. Observer
            zgłosił intersecting zanim ten element w ogóle wszedł w viewport —
            ratio było <code className="text-violet-300">{'> 0'}</code> już
            300px wcześniej.
          </p>
        </div>
      </div>
    </section>
  );
}
