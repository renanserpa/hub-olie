import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import { ThemeProvider } from './context/ThemeContext';
import { InitializerProvider } from './context/InitializerContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <InitializerProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </InitializerProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>
);