/**
 * Shadow DOM Host Component
 * Creates isolated DOM tree for style/event encapsulation
 * Renders children via React Portal into Shadow Root
 */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import type { ShadowHostHandle } from '@/integration/shadow-host';
import { createShadowHost } from '@/integration/shadow-host';

// Import CSS as raw string for injection into Shadow DOM
import styles from '../styles/detector.css?raw';

// Z-Index layers within Shadow DOM
const Z_INDEX = {
  OVERLAY: 10,
  PANEL: 9999,
} as const;

interface ShadowRootProps {
  children: ReactNode;
}

export function ShadowRoot({ children }: ShadowRootProps): ReactNode {
  const shadowHostRef = useRef<ShadowHostHandle | null>(null);
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(
    null,
  );

  useEffect(() => {
    const shadowHost = createShadowHost(styles);
    shadowHostRef.current = shadowHost;
    setPortalContainer(shadowHost.container);

    return () => {
      shadowHostRef.current?.destroy();
      shadowHostRef.current = null;
      setPortalContainer(null);
    };
  }, []);

  // Render via Portal once container is ready
  if (!portalContainer) {
    return null;
  }

  return createPortal(children, portalContainer);
}

export { Z_INDEX };
