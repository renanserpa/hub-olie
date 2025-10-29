import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './ui/Button';

// FIX: Renamed Props to be specific to this component to avoid potential global name conflicts.
interface ErrorBoundaryProps {
  children: ReactNode;
}

// FIX: Renamed State to be specific to this component.
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

// FIX: Changed from 'extends Component' to 'extends React.Component' to resolve an issue
// where TypeScript could not find the 'props' property on the component instance. This avoids
// potential naming conflicts with the destructured 'Component' import.
// FIX: Changed from a named export to a default export to match its usage in index.tsx.
// This resolves the error where 'props' was not found on the component instance.
export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: undefined,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
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
