import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { LoadingState } from './shared/FeedbackStates';
import { devLog } from '../lib/utils/log';

export const ProtectedRoute: React.FC = () => {
  const { user, organization, loading } = useApp();

  useEffect(() => {
    if (import.meta.env.DEV) {
      devLog('ProtectedRoute', 'Estado avaliado', {
        loading,
        hasUser: !!user,
        hasOrganization: !!organization,
      });
    }
  }, [loading, organization, user]);

  if (loading) {
    if (import.meta.env.DEV) {
      devLog('ProtectedRoute', 'Em loading, exibindo fallback');
    }

    return <LoadingState message="Validando sessão..." />;
  }

  if (!user) {
    if (import.meta.env.DEV) {
      devLog('ProtectedRoute', 'Sem usuário, redirecionando para login');
    }

    return <Navigate to="/login" replace />;
  }

  if (!organization) {
    if (import.meta.env.DEV) {
      devLog('ProtectedRoute', 'Usuário sem organização, enviando para seleção');
    }

    return <Navigate to="/select-org" replace />;
  }

  if (import.meta.env.DEV) {
    devLog('ProtectedRoute', 'Acesso liberado');
  }

  return <Outlet />;
};
