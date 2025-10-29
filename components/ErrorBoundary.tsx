import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './ui/Button';

type Props = { children: React.ReactNode };
type State = { hasError: boolean; error?: any };

export class ErrorBoundary extends React.Component<Props, State> {
  // FIX: Refactored to use a constructor for state initialization and method binding.
  // This classic approach avoids reliance on class field syntax, which might not be
  // correctly configured in the project's build environment, causing TypeScript
  // to fail to recognize `this.props` and `this.setState`.
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
    this.handleReload = this.handleReload.bind(this);
  }

  static getDerivedStateFromError(error: any): State {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, info: any) {
    console.error('💥 UI ErrorBoundary caught:', error, info);
  }

  handleReload() {
    this.setState({ hasError: false, error: undefined });
    // In a real app, you might try to re-render or navigate
    // For now, a reload is a simple and effective solution.
    window.location.reload();
  }

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
export default ErrorBoundary;
