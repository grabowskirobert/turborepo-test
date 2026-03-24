/**
 * FEAT-002 — Computed Selector Utility
 *
 * Builds a human-readable CSS selector for a DOM element using
 * Sibling Index notation (nth-of-type).
 *
 * Format examples:
 *   "img"                   — only child of its type
 *   "li:nth-of-type(3)"     — third <li> among siblings
 *   "div.product-card"      — div with class, first of its type
 *
 * @see feat-002.md § C.2 Computed Selector
 */

/**
 * Compute a short, readable selector for `el` relative to its parent.
 *
 * TODO(feat-002): implement
 *   1. tag = el.tagName.toLowerCase()
 *   2. classes = first 2 classes joined as ".foo.bar"
 *   3. count same-tag siblings in el.parentElement.children
 *   4. if siblings.length > 1 → append ":nth-of-type(N)"
 */
export function computeSelector(el: Element): string {
  const tag = el.tagName.toLowerCase();
  const classes = Array.from(el.classList)
    .slice(0, 2)
    .map((c) => `.${c}`)
    .join('');

  if (!el.parentElement) return `${tag}${classes}`;

  const siblings = Array.from(el.parentElement.children).filter(
    (child) => child.tagName === el.tagName,
  );

  if (siblings.length <= 1) return `${tag}${classes}`;

  const index = siblings.indexOf(el) + 1;
  return `${tag}${classes}:nth-of-type(${index})`;
}
