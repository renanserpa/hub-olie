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
  // FIX: Initialized state as a class property.
  // This is a more modern and concise syntax that resolves the underlying TypeScript
  // errors where `this.state` and `this.props` were not being correctly identified.
  public state: State = {
    hasError: false,
    error: undefined
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("🧱 ErrorBoundary caught an error:", error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-background text-center p-4">
          <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-textPrimary">⚠️ Algo deu errado</h1>
          <p className="text-textSecondary mt-2 mb-6 max-w-md">
            A aplicação encontrou um problema inesperado. Por favor, tente recarregar a página.
          </p>
           {this.state.error && (
             <pre className="mt-2 mb-4 text-xs text-red-600 bg-secondary p-2 rounded-md">
                {this.state.error.message}
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
