// Fix: Import useState and useEffect from React.
import React, { useState, useEffect } from 'react';
import { User, UserProfile } from './types';
import Toaster from './components/Toaster';
import { ShoppingCart, Settings, Workflow, MessagesSquare, Package, Users, Bell, ShieldAlert, Truck, Megaphone, ShoppingBasket, BarChart2, BarChartHorizontal, DollarSign, Cpu, LayoutDashboard, Lightbulb, BookOpen, ChevronsLeft, ChevronsRight, LogOut, Loader2 } from 'lucide-react';
import { Button } from './components/ui/Button';
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
import DashboardPage from './pages/DashboardPage';
import { cn } from './lib/utils';
import LoginPage from './components/LoginPage';
import { logout } from './services/authService';
import { ThemeToggle } from './components/ui/ThemeToggle';
import NotificationBell from './components/NotificationBell';
import { useApp } from './contexts/AppContext';
import { useOlie } from './contexts/OlieContext';
import Verify2FA from './components/Verify2FA';


const MAIN_TABS = [
    { id: 'dashboard', label: 'Painel', icon: LayoutDashboard, scope: 'Dashboard', description: 'Visão geral da operação com KPIs, status do sistema e atalhos.' },
    { id: 'initializer', label: 'Initializer', icon: Cpu, scope: 'Initializer', description: 'Sincronização e boot cognitivo do ecossistema AtlasAI.' },
    { id: 'executive', label: 'Diretoria', icon: BarChartHorizontal, scope: 'ExecutiveDashboard', description: 'Visão consolidada dos indicadores estratégicos do Olie Hub.' },
    { id: 'analytics', label: 'Analytics', icon: BarChart2, scope: 'Analytics', description: 'Painéis e relatórios de desempenho do Olie Hub.' },
    { id: 'orders', label: 'Pedidos', icon: ShoppingCart, scope: 'Orders', description: 'Gerencie e acompanhe todos os pedidos da sua loja.' },
    { id: 'production', label: 'Produção', icon: Workflow, scope: 'Production', description: 'Controle o chão de fábrica, da matéria-prima ao produto acabado.' },
    { id: 'inventory', label: 'Estoque', icon: Package, scope: 'Inventory', description: 'Consulte saldos, movimentações e transferências entre armazéns.' },
    { id: 'purchases', label: 'Compras', icon: ShoppingBasket, scope: 'Purchases', description: 'Gerencie fornecedores e pedidos de compra de materiais.' },
    { id: 'logistics', label: 'Logística', icon: Truck, scope: 'Logistics', description: 'Gerencie o fluxo de separação, embalagem e expedição.' },
    { id: 'finance', label: 'Financeiro', icon: DollarSign, scope: 'Finance', description: 'Gerencie contas, transações, e o fluxo de caixa.' },
    { id: 'omnichannel', label: 'Omnichannel', icon: MessagesSquare, scope: 'Omnichannel', description: 'Central de comunicação com o cliente em múltiplos canais.' },
    { id: 'marketing', label: 'Marketing', icon: Megaphone, scope: 'Marketing', description: 'Gerencie campanhas, segmente públicos e analise resultados.' },
    { id: 'contacts', label: 'Contatos', icon: Users, scope: 'Contacts', description: 'Gerencie seus clientes e fornecedores.' },
    { id: 'products', label: 'Produtos', icon: Package, scope: 'Products', description: 'Gerencie produtos, variações e os dados mestres do catálogo.' },
    { id: 'settings', label: 'Sistema', icon: Settings, scope: 'Settings', description: 'Gerencie parâmetros globais, integrações e segurança da plataforma.' },
];

const AccessDeniedPage: React.FC<{ role: string }> = ({ role }) => (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-center">
        <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-textPrimary dark:text-dark-textPrimary">Acesso Negado</h1>
        <p className="text-textSecondary dark:text-dark-textSecondary mt-2">
            Seu perfil de <span className="font-semibold">{role.replace('AdminGeral', 'Admin')}</span> não tem permissão para acessar esta página.
        </p>
    </div>
);

const App: React.FC = () => {
    const { user, isLoading: isAuthLoading, error: authError, activeModule, setActiveModule, isAIEnabled, mfaChallenge, setMfaChallenge } = useApp();
    const { can, goto } = useOlie();
    const [isDataLoading, setIsDataLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    useEffect(() => {
        if (!user) {
          setIsDataLoading(false);
          return;
        }
        setIsDataLoading(true);
        setTimeout(() => setIsDataLoading(false), 200);
    }, [user]);

    const renderActivePage = () => {
        if (!user) return null;

        if (!can(activeModule, 'read')) {
            return <AccessDeniedPage role={user.role} />;
        }

        switch (activeModule) {
            case 'dashboard':
                return <DashboardPage />;
            case 'initializer':
                return <InitializerPage />;
            case 'executive':
                return <ExecutiveDashboardPage />;
            case 'analytics':
                return <AnalyticsPage />;
            case 'settings':
                return <SettingsPage />;
            case 'production':
                return <ProductionPage />;
            case 'inventory':
                return <InventoryPage />;
            case 'purchases':
                return <PurchasesPage />;
            case 'logistics':
                return <LogisticsPage />;
            case 'finance':
                return <FinancePage />;
            case 'omnichannel':
                return <OmnichannelPage user={user} />;
            case 'marketing':
                return <MarketingPage />;
            case 'contacts':
                return <ContactsPage />;
            case 'products':
                return <ProductsPage />;
            case 'orders':
                return <OrdersPage user={user} />;
            default:
                return <DashboardPage />;
        }
    };
    
    if (isAuthLoading) {
        return (
            <div className="flex justify-center items-center h-screen bg-secondary dark:bg-dark-secondary">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
        );
    }
    
    if (authError) {
        return (
             <div className="flex flex-col items-center justify-center h-screen text-center bg-secondary dark:bg-dark-secondary">
                <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
                <h1 className="text-2xl font-bold">Erro de Autenticação</h1>
                <p className="text-red-600 mt-2 max-w-md">{authError}</p>
             </div>
        )
    }
    
    // MFA Challenge Flow
    if (mfaChallenge) {
        return <Verify2FA amr={mfaChallenge.amr} onVerified={() => setMfaChallenge(null)} />
    }

    if (!user) {
        return <LoginPage />;
    }
    
    const visibleTabs = MAIN_TABS.filter(tab => can(tab.scope, 'read'));

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Failed to log out', error);
        }
    }

    return (
        <div className="flex h-screen bg-secondary dark:bg-dark-secondary text-textPrimary dark:text-dark-textPrimary">
            {/* Sidebar */}
            <aside className={cn("flex flex-col bg-card dark:bg-dark-card border-r border-border dark:border-dark-border transition-all duration-300", isSidebarCollapsed ? "w-20" : "w-64")}>
                <div className={cn("flex items-center h-16 border-b border-border dark:border-dark-border px-4", isSidebarCollapsed ? "justify-center" : "justify-between")}>
                    {!isSidebarCollapsed && <h1 className="text-xl font-bold">Olie Hub</h1>}
                    <Button variant="ghost" size="icon" onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}>
                        {isSidebarCollapsed ? <ChevronsRight /> : <ChevronsLeft />}
                    </Button>
                </div>
                <nav className="flex-1 overflow-y-auto p-2 space-y-1">
                    {visibleTabs.map(tab => {
                        const Icon = tab.icon;
                        return (
                            <Button
                                key={tab.id}
                                variant={activeModule === tab.id ? "secondary" : "ghost"}
                                className={cn("w-full flex justify-start items-center gap-3", isSidebarCollapsed && "justify-center")}
                                onClick={() => setActiveModule(tab.id)}
                                title={tab.label}
                            >
                                <Icon className="w-5 h-5" />
                                {!isSidebarCollapsed && <span>{tab.label}</span>}
                            </Button>
                        )
                    })}
                </nav>
                <div className="p-2 border-t border-border dark:border-dark-border">
                    <Button variant="ghost" className={cn("w-full flex justify-start items-center gap-3", isSidebarCollapsed && "justify-center")} onClick={handleLogout} title="Sair">
                        <LogOut className="w-5 h-5" />
                        {!isSidebarCollapsed && <span>Sair</span>}
                    </Button>
                </div>
            </aside>
            
            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="flex items-center justify-between h-16 px-6 border-b border-border dark:border-dark-border bg-card dark:bg-dark-card flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-semibold">{MAIN_TABS.find(t => t.id === activeModule)?.label}</h2>
                        <p className="text-sm text-textSecondary dark:text-dark-textSecondary">{MAIN_TABS.find(t => t.id === activeModule)?.description}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <NotificationBell />
                        <ThemeToggle />
                        {/* User Profile - simplified */}
                        <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center font-semibold text-sm">
                            {user.email.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </header>
                <div className="flex-1 overflow-y-auto p-6">
                    {isDataLoading ? (
                        <div className="flex justify-center items-center h-full">
                            <Loader2 className="w-12 h-12 animate-spin text-primary" />
                        </div>
                    ) : renderActivePage()}
                </div>
            </main>
            
            <Toaster />
        </div>
    );
};
// FIX: Add default export to resolve module loading error in index.tsx.
export default App;
