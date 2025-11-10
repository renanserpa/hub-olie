import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './ui/Button';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

// FIX: The ErrorBoundary class must extend React.Component and be typed with its Props and State interfaces.
// This makes it a valid React component, giving it access to `this.props` and `this.state`, and allows it to be used with children in JSX.
export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // FIX: The constructor is necessary to initialize state. It must call `super(props)` before any other statement.
  // This resolves errors where `this.props` is unavailable and allows `this.state` to be set.
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: undefined,
    };
  }

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('💥 UI ErrorBoundary caught:', error, errorInfo);
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