import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';

// Global resilience handler to log errors rather than breaking silently
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    console.warn('Caught window error:', event.message || event);
  });
  window.addEventListener('unhandledrejection', (event) => {
    console.warn('Caught unhandled promise rejection:', event.reason);
  });
}

const rootEl = document.getElementById('root');
if (rootEl) {
  createRoot(rootEl).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  );
}

