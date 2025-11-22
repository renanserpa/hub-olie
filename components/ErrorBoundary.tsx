import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './ui/Button';

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
    error: undefined,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('💥 UI ErrorBoundary caught:', error, errorInfo);
  }

  handleReload = () => {
    // Limpa cache crítico antes de recarregar
    localStorage.clear();
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-50 text-center p-4 font-sans">
            <div className="bg-white p-8 rounded-xl shadow-xl max-w-lg w-full border border-red-100">
                <div className="bg-red-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Erro de Inicialização</h1>
                <p className="text-gray-600 mt-2 mb-6">
                  O sistema encontrou um erro crítico. Isso geralmente é resolvido limpando o cache.
                </p>
                
                <div className="bg-gray-100 p-4 rounded-lg text-left mb-6 overflow-auto max-h-40">
                    <p className="text-xs font-mono text-red-600 break-all">
                        {this.state.error?.message || 'Erro desconhecido'}
                    </p>
                </div>

                <Button onClick={this.handleReload} className="w-full bg-red-600 hover:bg-red-700 text-white">
                  Limpar Cache e Recarregar
                </Button>
            </div>
        </div>
      );
    }
    
    return (this as any).props.children;
  }
}