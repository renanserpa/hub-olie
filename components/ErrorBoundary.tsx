import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './ui/Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-background text-center p-4">
          <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-textPrimary">Ocorreu um Erro</h1>
          <p className="text-textSecondary mt-2 mb-6 max-w-md">
            A aplicação encontrou um problema inesperado. Por favor, tente recarregar a página.
          </p>
          <Button onClick={this.handleReload}>
            Recarregar Página
          </Button>
          {process.env.NODE_ENV !== 'production' && this.state.error && (
            <details className="mt-6 text-left bg-secondary p-4 rounded-lg max-w-2xl mx-auto">
              <summary className="font-medium cursor-pointer">Detalhes do Erro (Desenvolvimento)</summary>
              <pre className="mt-2 text-xs text-red-600 whitespace-pre-wrap">
                {this.state.error.stack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
