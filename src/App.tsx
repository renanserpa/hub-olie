import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppTour } from './components/AppTour';
import { useApp } from './contexts/AppContext';
import LoginPage from './modules/auth/LoginPage';
import OrganizationSelectPage from './modules/organizations/OrganizationSelectPage';
import DashboardPage from './modules/dashboard/DashboardPage';
import OrdersListPage from './modules/orders/pages/OrdersListPage';
import OrderDetailPage from './modules/orders/pages/OrderDetailPage';
import OrderFormPage from './modules/orders/pages/OrderFormPage';
import CustomersListPage from './modules/crm/pages/CustomersListPage';
import CustomerFormPage from './modules/crm/pages/CustomerFormPage';
import ProductionOrdersListPage from './modules/production/pages/ProductionOrdersListPage';
import ProductionOrderDetailPage from './modules/production/pages/ProductionOrderDetailPage';
import InventoryPage from './modules/inventory/InventoryPage';
import LogisticsPage from './modules/logistics/LogisticsPage';
import FinancePage from './modules/finance/FinancePage';
import SettingsPage from './modules/settings/SettingsPage';
import { DebugPage } from './modules/debug/DebugPage';

const App: React.FC = () => {
  const { user, organization, tourSeen, completeTour } = useApp();

  console.log('[OlieHub] AppRoutes render, user/organization:', { user, organization });

  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/select-org" element={<OrganizationSelectPage />} />
        {import.meta.env.DEV && (
          <Route element={<ProtectedRoute />}>
            <Route path="/__debug" element={<DebugPage />} />
          </Route>
        )}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route index element={<DashboardPage />} />
            <Route path="orders" element={<OrdersListPage />} />
            <Route path="orders/new" element={<OrderFormPage />} />
            <Route path="orders/:id" element={<OrderDetailPage />} />
            <Route path="orders/:id/edit" element={<OrderFormPage />} />
            <Route path="customers" element={<CustomersListPage />} />
            <Route path="customers/new" element={<CustomerFormPage />} />
            <Route path="customers/:id" element={<CustomerFormPage />} />
            <Route path="production" element={<ProductionOrdersListPage />} />
            <Route path="production/:id" element={<ProductionOrderDetailPage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="logistics" element={<LogisticsPage />} />
            <Route path="finance" element={<FinancePage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Route>
        {import.meta.env.DEV && (
          <Route element={<ProtectedRoute />}>
            <Route path="/__debug" element={<DebugPage />} />
          </Route>
        )}
        <Route path="*" element={<Navigate to={user ? (organization ? '/' : '/select-org') : '/login'} replace />} />
      </Routes>
      <AppTour open={!!user && !!organization && !tourSeen} onClose={completeTour} />
    </>
  );
};

export default App;
