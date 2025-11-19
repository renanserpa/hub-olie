import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Spinner } from '../ui/spinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
        <Spinner />
      </div>
    );
  }

  if (!user) {
    // Redireciona para login se não estiver autenticado
    return <Navigate to="/login" replace />;
  }

  // Renderiza o conteúdo protegido se autenticado
  return <>{children}</>;
}