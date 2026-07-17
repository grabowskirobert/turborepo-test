const highlightOutline = '2px solid #7c3aed';
const highlightOutlineOffset = '2px';
const flashDurationMs = 800;

function isConnectedTarget(target: Element | null): target is Element {
  return target !== null && target.isConnected;
}

export function highlightTarget(target: Element | null): void {
  if (!isConnectedTarget(target)) return;

  const htmlTarget = target as HTMLElement;
  htmlTarget.style.outline = highlightOutline;
  htmlTarget.style.outlineOffset = highlightOutlineOffset;
}

export function clearTargetHighlight(target: Element | null): void {
  if (!isConnectedTarget(target)) return;

  const htmlTarget = target as HTMLElement;
  htmlTarget.style.outline = '';
  htmlTarget.style.outlineOffset = '';
}

export function inspectTarget(target: Element | null): void {
  if (!isConnectedTarget(target)) return;

  console.log('[IO-Detector] Target Element:', target);
}

export function flashTarget(
  target: Element | null,
): ReturnType<typeof setTimeout> | null {
  if (!isConnectedTarget(target)) return null;

  target.scrollIntoView({ behavior: 'smooth', block: 'center' });
  target.setAttribute('data-io-flash', '');

  return setTimeout(() => {
    if (target.isConnected) {
      target.removeAttribute('data-io-flash');
    }
  }, flashDurationMs);
}
