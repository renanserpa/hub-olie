import React, { ReactNode, ErrorInfo } from 'react';

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: undefined
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('💥 UI ErrorBoundary caught:', error, errorInfo);
  }

  handleReload = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'sans-serif', padding: '20px', textAlign: 'center' }}>
            <h1 style={{ fontSize: '24px', marginBottom: '10px' }}>Erro de Renderização</h1>
            <p style={{ color: '#666', marginBottom: '20px' }}>Ocorreu um erro inesperado na interface.</p>
            <pre style={{ backgroundColor: '#f3f4f6', padding: '15px', borderRadius: '8px', color: '#ef4444', marginBottom: '20px', maxWidth: '100%', overflow: 'auto' }}>
                {this.state.error?.message || 'Erro desconhecido'}
            </pre>
            <button onClick={this.handleReload} style={{ padding: '10px 20px', backgroundColor: '#333', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                Recarregar Página
            </button>
        </div>
      );
    }
    return this.props.children;
  }
}
