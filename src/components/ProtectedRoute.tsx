import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { Skeleton } from './shared/Skeleton';

export const ProtectedRoute: React.FC = () => {
  const { user, organization, loading } = useApp();

  if (loading) {
    return <Skeleton className="h-32 w-full" />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!organization) {
    return <Navigate to="/select-org" replace />;
  }

  return <Outlet />;
};
