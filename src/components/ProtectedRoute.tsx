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
    return <LoadingState message="Validando sessão..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!organization) {
    return <Navigate to="/select-org" replace />;
  }

  return <Outlet />;
};
