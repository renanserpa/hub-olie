import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { Skeleton } from './shared/Skeleton';

export const ProtectedRoute: React.FC = () => {
  const { user, organization, loading } = useApp();

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="w-full max-w-2xl space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <p className="text-center text-sm text-slate-500">Preparando seu acesso...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!organization) {
    return <Navigate to="/select-org" replace />;
  }

  return <Outlet />;
};
