import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';

export const ProtectedRoute: React.FC = () => {
  const { user, organization } = useApp();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (!organization) {
    return <Navigate to="/organizations" replace />;
  }
  return <Outlet />;
};
