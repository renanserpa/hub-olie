import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { devLog } from '../lib/utils/log';

export const ProtectedRoute: React.FC = () => {
  const { user, organization, loading } = useApp();

  if (loading) {
    return null;
  }

  if (!user) {
    devLog('[Route]', 'Redirecting to /login (no user)');
    return <Navigate to="/login" replace />;
  }

  if (!organization) {
    devLog('[Route]', 'Redirecting to /select-org (no organization)');
    return <Navigate to="/select-org" replace />;
  }

  devLog('[Route]', 'Access granted to protected route', {
    hasUser: !!user,
    hasOrganization: !!organization,
  });
  return <Outlet />;
};
