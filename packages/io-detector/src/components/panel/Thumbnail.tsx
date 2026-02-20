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

/**
 * TODO(feat-002): implement
 *   - Check: target.tagName === 'IMG'
 *     → src = (target as HTMLImageElement).src
 *   - Check: getComputedStyle(target).backgroundImage !== 'none'
 *     → extract url(...) value
 *   - Call incrementThumbnailCount(); if returns false → render null (cap hit)
 *   - Render: <img loading="lazy" src={src} className="io-thumbnail" alt="" />
 *   - Otherwise render null (no generic div thumbnails)
 */
export function Thumbnail({ target }: ThumbnailProps): ReactNode {
  // TODO(feat-002): implement
  void target;
  void incrementThumbnailCount;
  return null;
}
