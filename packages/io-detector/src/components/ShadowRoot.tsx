/**
 * Shadow DOM Host Component
 * Creates isolated DOM tree for style/event encapsulation
 * Renders children via React Portal into Shadow Root
 */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

// Import CSS as raw string for injection into Shadow DOM
import styles from '../styles/detector.css?raw';

const SHADOW_HOST_ID = '__io-detector-root';

// Z-Index layers within Shadow DOM
const Z_INDEX = {
  OVERLAY: 10,
  PANEL: 9999,
} as const;

interface ShadowRootProps {
  children: ReactNode;
}

/**
 * Stop event propagation to prevent interference with host app
 * Only stop propagation in bubble phase, after React handlers have fired
 */
function stopPropagation(e: Event): void {
  // Don't stop propagation within shadow DOM - let React handlers fire
  // Only prevent bubbling to host document
  if (e.target && (e.target as Element).getRootNode() instanceof ShadowRoot) {
    e.stopPropagation();
  }
}

export function ShadowRoot({ children }: ShadowRootProps): ReactNode {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const shadowRootRef = useRef<ShadowRoot | null>(null);
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(
    null,
  );

  useEffect(() => {
    // Create Shadow Host
    const host = document.createElement('div');
    host.id = SHADOW_HOST_ID;

    // Host styling - max z-index, fixed position, no pointer events on host itself
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
    hostRef.current = host;

    // Attach Shadow Root
    const shadow = host.attachShadow({ mode: 'open' });
    shadowRootRef.current = shadow;

    // Inject styles
    const styleElement = document.createElement('style');
    styleElement.textContent = styles;
    shadow.appendChild(styleElement);

    // Create container for React Portal
    const container = document.createElement('div');
    container.className = 'io-detector-container';
    // Enable pointer events on the actual UI container
    container.style.pointerEvents = 'auto';
    shadow.appendChild(container);

    setPortalContainer(container);

    // Event isolation - stop propagation at shadow boundary
    // Use bubble phase (false) so React handlers fire first
    const events = [
      'click',
      'mousedown',
      'mouseup',
      'keydown',
      'keyup',
      'keypress',
    ] as const;
    events.forEach((eventType) => {
      container.addEventListener(eventType, stopPropagation, false);
    });

    // Cleanup
    return () => {
      events.forEach((eventType) => {
        container.removeEventListener(eventType, stopPropagation, false);
      });

      if (hostRef.current && document.body.contains(hostRef.current)) {
        document.body.removeChild(hostRef.current);
      }

      hostRef.current = null;
      shadowRootRef.current = null;
    };
  }, []);

  // Render via Portal once container is ready
  if (!portalContainer) {
    return null;
  }

  return createPortal(children, portalContainer);
}

export { Z_INDEX };
