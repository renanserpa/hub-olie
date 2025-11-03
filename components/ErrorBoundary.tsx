import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './ui/Button';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // FIX: Reverted to using a constructor to initialize state. The class property syntax, while modern,
  // was causing a compilation error where `this.props` was not recognized. Using an explicit constructor
  // with `super(props)` guarantees that the component's props are correctly initialized.
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: undefined,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('💥 UI ErrorBoundary caught:', error, errorInfo);
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
            <details className="mt-2 mb-4 text-xs text-red-600 bg-secondary p-3 rounded-xl max-w-full text-left">
              <summary className="cursor-pointer font-medium">Detalhes do Erro</summary>
              <pre className="mt-2 whitespace-pre-wrap break-all">
                  {String(this.state.error?.stack || this.state.error || '')}
              </pre>
            </details>
            <Button onClick={this.handleReload}>
              Recarregar Página
            </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
