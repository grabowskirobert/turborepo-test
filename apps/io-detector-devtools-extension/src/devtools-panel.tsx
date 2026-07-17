import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { DevtoolsPanel } from './presentation/devtools-panel';

const container = document.getElementById('root');
if (container) {
  createRoot(container).render(
    <StrictMode>
      <DevtoolsPanel />
    </StrictMode>,
  );
}
