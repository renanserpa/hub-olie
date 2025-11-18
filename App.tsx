import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Toaster from './components/Toaster';
import LoginPage from './components/LoginPage';
import DashboardPage from './pages/DashboardPage';
import OrdersPage from './components/OrdersPage';
import ProductionPage from './components/ProductionPage';
import OmnichannelPage from './components/OmnichannelPage';
import InventoryPage from './components/InventoryPage';
import ContactsPage from './components/ContactsPage';
import ProductsPage from './components/ProductsPage';
import SettingsPage from './components/SettingsPage';
import LogisticsPage from './components/LogisticsPage';
import MarketingPage from './pages/MarketingPage';
import PurchasesPage from './pages/PurchasesPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ExecutiveDashboardPage from './pages/ExecutiveDashboardPage';
import FinancePage from './pages/FinancePage';
import InitializerPage from './hub-initializer/pages/InitializerPage';
import { useApp } from './contexts/AppContext';
import { MainLayout } from './components/Layout/MainLayout';
import { ProtectedRoute } from './components/Navigation/ProtectedRoute';
import { Spinner } from './components/ui/Spinner';

const AppContent: React.FC = () => {
    const { user, isLoading } = useApp();

    // Mostra o Spinner enquanto a autenticação inicial é verificada
    if (isLoading) {
        return <Spinner />;
    }

    return (
        <BrowserRouter>
            <Routes>
                {/* Rota Pública */}
                <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" replace />} />

                {/* Rotas Protegidas */}
                <Route path="/" element={
                    <ProtectedRoute>
                        <MainLayout />
                    </ProtectedRoute>
                }>
                    <Route index element={<DashboardPage />} />
                    <Route path="initializer" element={<InitializerPage />} />
                    <Route path="executive" element={<ExecutiveDashboardPage />} />
                    <Route path="analytics" element={<AnalyticsPage />} />
                    <Route path="orders" element={<OrdersPage />} />
                    <Route path="production" element={<ProductionPage />} />
                    <Route path="inventory" element={<InventoryPage />} />
                    <Route path="purchases" element={<PurchasesPage />} />
                    <Route path="logistics" element={<LogisticsPage />} />
                    <Route path="finance" element={<FinancePage />} />
                    <Route path="omnichannel" element={<OmnichannelPage user={user!} />} />
                    <Route path="marketing" element={<MarketingPage />} />
                    <Route path="contacts" element={<ContactsPage />} />
                    <Route path="products" element={<ProductsPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                    
                    {/* Rota de fallback para 404 dentro da área logada */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
            </Routes>
            
            <Toaster />
        </BrowserRouter>
    );
};

const App: React.FC = () => {
    return <AppContent />;
};

export default App;
