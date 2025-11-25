import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import { AppProvider } from './contexts/AppContext';
import { ToastProvider } from './contexts/ToastContext';
import ErrorBoundary from './components/ErrorBoundary';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

console.log('[OlieHub] main.tsx carregado, montando <App />');
const root = createRoot(rootElement);

root.render(
  <React.StrictMode>
    <HashRouter>
      <ToastProvider>
        <AppProvider>
          <ErrorBoundary>
            <App />
          </ErrorBoundary>
        </AppProvider>
      </ToastProvider>
    </HashRouter>
  </React.StrictMode>,
);
