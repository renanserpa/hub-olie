import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './ui/Button';

type Props = { children: React.ReactNode };
type State = { hasError: boolean; error?: Error };

class ErrorBoundary extends React.Component<Props, State> {
  // FIX: Initialized state as a class property to fix errors where `this.state` was not found.
  state: State = { hasError: false, error: undefined };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('💥 UI ErrorBoundary caught:', error, info);
  }

  handleReload = () => {
    window.location.reload();
  };
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-background text-center p-4">
            <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
            <h1 className="text-2xl font-bold text-textPrimary">⚠️ Algo deu errado</h1>
            <p className="text-textSecondary mt-2 mb-6 max-w-md">
              A aplicação encontrou um problema inesperado. Por favor, tente recarregar a página.
            </p>
            {this.state.error && (
              <pre className="mt-2 mb-4 text-xs text-red-600 bg-secondary p-3 rounded-xl max-w-full overflow-auto">
                  {this.state.error.stack || this.state.error.message}
              </pre>
            )}
            <Button onClick={this.handleReload}>
              Recarregar Página
            </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;