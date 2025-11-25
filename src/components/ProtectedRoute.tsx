import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { LoadingState } from './shared/FeedbackStates';

export const ProtectedRoute: React.FC = () => {
  const { user, organization, loading } = useApp();

  if (loading) {
    return <LoadingState message="Preparando seu acesso..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!organization) {
    return <Navigate to="/select-org" replace />;
  }

  return <Outlet />;
};
