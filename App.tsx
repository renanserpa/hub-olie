// Fix: Import useState and useEffect from React.
import React, { useState, useEffect } from 'react';
import { User } from './types';
import Toaster from './components/Toaster';
import { ShoppingCart, Settings, Workflow, MessagesSquare, Package, Users, Bell, ShieldAlert, Truck, Megaphone, ShoppingBasket, BarChart2, BarChartHorizontal, DollarSign, Cpu, LayoutDashboard, Lightbulb, BookOpen, ChevronsLeft, ChevronsRight, LogOut } from 'lucide-react';
import { Button } from './components/ui/Button';
import OrdersPage from './components/OrdersPage';
import ProductionPage from './components/ProductionPage';
import OmnichannelPage from './components/OmnichannelPage';
import InventoryPage from './components/InventoryPage';
import ContactsPage from './components/ContactsPage';
import ProductsPage from './components/ProductsPage';
import SettingsPage from './components/SettingsPage';
import CatalogPage from './pages/CatalogPage';
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
import { runtime } from './lib/runtime';
import { ThemeToggle } from './components/ui/ThemeToggle';
import NotificationBell from './components/NotificationBell';
import { useApp } from './contexts/AppContext';
import { useOlie } from './contexts/OlieContext';


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
    { id: 'settings', label: 'Configurações', icon: Settings, scope: 'Settings', description: 'Gerencie os dados mestres e configurações globais da plataforma.' },
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
    const { user, isLoading: isAuthLoading, error: authError, activeModule, setActiveModule, isAIEnabled } = useApp();
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

        // The 'catalog' page is now part of 'products', but we might have old bookmarks.
        // Let's redirect to 'products' if 'catalog' is requested.
        if (activeModule === 'catalog') {
            return <ProductsPage />;
        }

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
                return <OmnichannelPage user={user as User} />;
            case 'marketing':
                return <MarketingPage />;
            case 'contacts':
                return <ContactsPage />;
            case 'products':
                return <ProductsPage />;
            case 'orders':
            default:
                return <OrdersPage user={user} />;
        }
    };
    
    if (isAuthLoading || (user && isDataLoading)) {
        return (
            <div className="flex justify-center items-center h-screen bg-background dark:bg-dark-background">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-primary"></div>
                    <p className="mt-4 text-lg font-semibold text-textSecondary dark:text-dark-textSecondary">Carregando Olie Hub...</p>
                </div>
            </div>
        );
    }
    
    if (!user) {
        return <LoginPage />;
    }
    
    const isSandbox = runtime.mode === 'SANDBOX';
    const visibleTabs = MAIN_TABS.filter(tab => can(tab.scope, 'read'));
    const activeTabInfo = MAIN_TABS.find(tab => tab.id === activeModule);
    
    return (
        <div className="min-h-screen font-sans bg-background dark:bg-dark-background">
            {isSandbox && (
                <div className="w-full text-center text-xs py-1 bg-amber-100 text-amber-800 border-b border-amber-200 dark:bg-amber-900/50 dark:text-amber-300 dark:border-amber-800 sticky top-0 z-50">
                    SANDBOX MODE (offline) — sem chamadas de rede
                </div>
            )}
            <Toaster />
            <div className="flex">
                <aside className={cn(
                    "bg-secondary dark:bg-dark-secondary border-r border-border dark:border-dark-border h-screen flex flex-col p-4 sticky transition-all duration-300 ease-in-out", 
                    isSidebarCollapsed ? "w-20" : "w-64",
                    isSandbox ? "top-[25px]" : "top-0"
                )}>
                    <div className={cn("px-2 mb-8 transition-all h-8", isSidebarCollapsed && "px-0 text-center")}>
                         {isSidebarCollapsed ? (
                            <Cpu className="w-8 h-8 mx-auto text-primary"/>
                        ) : (
                            <h1 className="text-xl font-bold text-textPrimary dark:text-dark-textPrimary">Olie Hub</h1>
                        )}
                    </div>
                    <nav className="flex flex-col space-y-2">
                        {visibleTabs.map(tab => (
                            <button key={tab.id} onClick={() => goto(tab.id)}
                                title={isSidebarCollapsed ? tab.label : undefined}
                                className={cn('flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-colors',
                                    activeModule === tab.id ? 'bg-primary text-white' : 'text-textSecondary dark:text-dark-textSecondary hover:bg-accent dark:hover:bg-dark-accent hover:text-textPrimary dark:hover:text-dark-textPrimary',
                                    isSidebarCollapsed && "justify-center"
                                )}>
                                <tab.icon className="w-5 h-5 flex-shrink-0" />
                                {!isSidebarCollapsed && <span>{tab.label}</span>}
                            </button>
                        ))}
                    </nav>
                     <div className="mt-auto pt-4 border-t border-border dark:border-dark-border space-y-2">
                         <Button
                            variant="ghost"
                            className="w-full text-textSecondary"
                            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                            title={isSidebarCollapsed ? 'Expandir menu' : 'Recolher menu'}
                        >
                            {isSidebarCollapsed ? <ChevronsRight className="h-5 w-5" /> : <ChevronsLeft className="h-5 w-5" />}
                        </Button>
                        <Button 
                            variant="outline" 
                            className="w-full" 
                            onClick={logout}
                            title="Sair"
                        >
                            {isSidebarCollapsed ? <LogOut className="h-5 w-5" /> : <span>Sair</span>}
                        </Button>
                    </div>
                </aside>

                <main className="flex-1">
                     <header className={cn("bg-background/80 dark:bg-dark-background/80 backdrop-blur-sm border-b border-border dark:border-dark-border z-10 sticky", isSandbox ? "top-[25px]" : "top-0")}>
                        <div className="container mx-auto px-6 h-20 flex justify-between items-center">
                           <div className="relative w-full max-w-md">
                           </div>
                            <div className="flex items-center gap-4">
                                <ThemeToggle />
                                <NotificationBell />
                                {user && (
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                                            {user.email.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm text-textPrimary dark:text-dark-textPrimary truncate">{user.email.split('@')[0]}</p>
                                            <p className="text-xs text-textSecondary dark:text-dark-textSecondary">{user.role.replace('AdminGeral', 'Admin')}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </header>
                    <div className="container mx-auto p-4 sm:p-6">
                        {isAIEnabled && (
                            <div className="mb-4 flex items-center gap-2 text-sm text-blue-800 bg-blue-100 p-3 rounded-lg dark:bg-blue-900/30 dark:text-blue-200">
                                <Lightbulb size={16} />
                                <span>**IA Ativa** — Insights preditivos fornecidos pelo Gemini Layer.</span>
                            </div>
                        )}
                        {activeTabInfo && can(activeTabInfo.scope, 'read') && (
                            <div className="mb-6">
                                 <div className="flex items-center gap-3">
                                    <activeTabInfo.icon className="text-primary" size={28}/>
                                    <h1 className="text-3xl font-bold text-textPrimary">{activeTabInfo.label}</h1>
                                </div>
                                <p className="text-textSecondary mt-1">{activeTabInfo.description}</p>
                            </div>
                        )}
                        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl relative mb-4" role="alert" onClick={() => setError(null)}>{error}</div>}
                        {renderActivePage()}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default App;