import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Core, Contexts & Layout
import { useApp } from './contexts/AppContext';
import { MainLayout } from './components/Layout/MainLayout';
import { ProtectedRoute } from './components/Navigation/ProtectedRoute';
import Toaster from './components/Toaster';
import LoginPage from './components/LoginPage';
import { Spinner } from './components/ui/Spinner';

// Pages (Modules)
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import SettingsPage from './pages/SettingsPage';
import MarketingPage from './pages/MarketingPage';
import PurchasesPage from './pages/PurchasesPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ExecutiveDashboardPage from './pages/ExecutiveDashboardPage';
import FinancePage from './pages/FinancePage';
import InitializerPage from './hub-initializer/pages/InitializerPage';

// Components acting as Pages (Legacy - Pending migration to /pages)
import OrdersPage from './components/OrdersPage';
import ProductionPage from './components/ProductionPage';
import InventoryPage from './components/InventoryPage';
import LogisticsPage from './components/LogisticsPage';
import OmnichannelPage from './components/OmnichannelPage';
import ContactsPage from './components/ContactsPage';

const AppContent: React.FC = () => {
    const { user, isLoading } = useApp();

    useEffect(() => {
        if (!isLoading) {
            console.log("[App] Roteamento inicializado. Usuário:", user?.email || "Não autenticado");
        }
    }, [user, isLoading]);

    if (isLoading) {
        return <Spinner />;
    }

    return (
        <BrowserRouter>
            <Routes>
                {/* Rota 1: PÚBLICA - Login */}
                {/* Se o usuário já estiver logado, redireciona para o Dashboard (/) */}
                <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" replace />} />

                {/* Rota 2: PROTEGIDA - Layout Principal */}
                <Route path="/" element={
                    <ProtectedRoute>
                        <MainLayout />
                    </ProtectedRoute>
                }>
                    {/* Dashboard & Core */}
                    <Route index element={<DashboardPage />} />
                    <Route path="dashboard" element={<Navigate to="/" replace />} />
                    
                    {/* Módulos de Negócio */}
                    <Route path="orders" element={<OrdersPage />} />
                    <Route path="production" element={<ProductionPage />} />
                    <Route path="inventory" element={<InventoryPage />} />
                    <Route path="purchases" element={<PurchasesPage />} />
                    <Route path="logistics" element={<LogisticsPage />} />
                    <Route path="finance" element={<FinancePage />} />
                    <Route path="marketing" element={<MarketingPage />} />
                    <Route path="contacts" element={<ContactsPage />} />
                    <Route path="products" element={<ProductsPage />} />
                    
                    {/* Atendimento */}
                    <Route path="omnichannel" element={<OmnichannelPage user={user!} />} />
                    
                    {/* Inteligência & Gestão */}
                    <Route path="analytics" element={<AnalyticsPage />} />
                    <Route path="executive" element={<ExecutiveDashboardPage />} />
                    <Route path="initializer" element={<InitializerPage />} />
                    
                    {/* Configurações */}
                    <Route path="settings" element={<SettingsPage />} /> 
                    <Route path="system-config" element={<SettingsPage />} />
                </Route>
                
                {/* Rota 3: Fallback Global - Redireciona qualquer rota desconhecida para a raiz */}
                {/* A raiz (/) é protegida, então se não houver user, o ProtectedRoute mandará para /login */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            
            <Toaster />
        </BrowserRouter>
    );
};

const App: React.FC = () => {
    return <AppContent />;
};

export default App;
