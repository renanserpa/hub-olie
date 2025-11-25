import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[OlieHub ErrorBoundary]', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  renderFallback() {
    const { error } = this.state;

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div
          className="max-w-lg w-full bg-white border border-gray-200 shadow-sm rounded-lg p-8 text-center"
          role="alert"
          aria-live="assertive"
        >
          <h1 className="text-2xl font-semibold text-gray-900 mb-3">Algo deu errado no OlieHub</h1>
          <p className="text-gray-600 mb-6">
            Encontramos um problema ao carregar a tela. Você pode tentar recarregar para voltar ao painel.
          </p>
          <button
            type="button"
            onClick={this.handleReload}
            aria-label="Recarregar a página e tentar novamente"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Recarregar página
          </button>
          {error?.message ? (
            <div className="mt-6 text-left bg-gray-50 border border-gray-200 rounded-md p-4 text-sm text-gray-700">
              <p className="font-medium text-gray-800">Detalhes do erro</p>
              <p className="mt-1 break-words">{error.message}</p>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  render() {
    if (this.state.hasError) {
      return this.renderFallback();
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
