import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import { AppContextProvider } from './contexts/AppContext';
import { OlieContextProvider } from './contexts/OlieContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

try {
    const root = createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <AppContextProvider>
            <OlieContextProvider>
              <App />
            </OlieContextProvider>
          </AppContextProvider>
        </ErrorBoundary>
      </React.StrictMode>
    );
} catch (error) {
    console.error("Failed to mount React application:", error);
    rootElement.innerHTML = `
        <div style="color: red; padding: 20px; text-align: center; font-family: sans-serif;">
            <h1>Erro Fatal na Aplicação</h1>
            <p>Não foi possível iniciar o React. Verifique o console para mais detalhes.</p>
            <pre style="background: #f8d7da; padding: 10px; border-radius: 5px; overflow: auto;">${error instanceof Error ? error.message : String(error)}</pre>
        </div>
    `;
}