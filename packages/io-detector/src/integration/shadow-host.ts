const SHADOW_HOST_ID = '__io-detector-root';

const isolatedEvents = [
  'click',
  'mousedown',
  'mouseup',
  'keydown',
  'keyup',
  'keypress',
] as const;

export interface ShadowHostHandle {
  container: HTMLDivElement;
  destroy: VoidFunction;
}

/**
 * Stop event propagation to prevent interference with host app.
 * Uses bubble phase so React handlers fire before propagation is stopped.
 */
function stopPropagation(event: Event): void {
  if (
    event.target &&
    (event.target as Element).getRootNode() instanceof ShadowRoot
  ) {
    event.stopPropagation();
  }
}

export function createShadowHost(styles: string): ShadowHostHandle {
  const host = document.createElement('div');
  host.id = SHADOW_HOST_ID;

  Object.assign(host.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '0',
    height: '0',
    zIndex: '2147483647',
    pointerEvents: 'none',
  });

  document.body.appendChild(host);

  const shadow = host.attachShadow({ mode: 'open' });

  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  shadow.appendChild(styleElement);

  const container = document.createElement('div');
  container.className = 'io-detector-container';
  container.style.pointerEvents = 'auto';
  shadow.appendChild(container);

  isolatedEvents.forEach((eventType) => {
    container.addEventListener(eventType, stopPropagation, false);
  });

  return {
    container,
    destroy: () => {
      isolatedEvents.forEach((eventType) => {
        container.removeEventListener(eventType, stopPropagation, false);
      });

      if (document.body.contains(host)) {
        document.body.removeChild(host);
      }
    },
  };
}
