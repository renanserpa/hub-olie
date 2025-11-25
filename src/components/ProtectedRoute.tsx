import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';

export const ProtectedRoute: React.FC = () => {
  const { user, organization, loading } = useApp();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-900">
        <div role="status" aria-live="polite" className="text-sm font-medium">
          Carregando OlieHub...
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
