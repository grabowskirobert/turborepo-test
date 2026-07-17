/**
 * FEAT-002 — Thumbnail
 *
 * Renders a thumbnail ONLY for <img> targets or elements with
 * a computed background-image. Enforces session cap of MAX_THUMBNAILS.
 *
 * @see feat-002.md § C.1 Thumbnail (Strict)
 */
import type { ReactNode } from 'react';
import { incrementThumbnailCount } from '@/stores';

interface ThumbnailProps {
  target: Element;
}

export function Thumbnail({ target }: ThumbnailProps): ReactNode {
  let src: string | null = null;

  if (target.tagName === 'IMG') {
    src = (target as HTMLImageElement).src || null;
  } else {
    const bg = getComputedStyle(target).backgroundImage;
    if (bg && bg !== 'none') {
      const match = /url\("?(.+?)"?\)/.exec(bg);
      src = match?.[1] ?? null;
    }
  }

  if (!src) return null;
  if (!incrementThumbnailCount()) return null;

  return <img loading="lazy" src={src} className="io-thumbnail" alt="" />;
}
