
import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { useOlie } from '../../contexts/OlieContext';
import { ThemeToggle } from '../ui/ThemeToggle';
import NotificationBell from '../NotificationBell';
import { Button } from '../ui/Button';
import { 
    ShoppingCart, Settings, Workflow, MessagesSquare, Package, 
    Users, Truck, Megaphone, ShoppingBasket, BarChart2, 
    BarChartHorizontal, DollarSign, Cpu, LayoutDashboard, 
    ChevronsLeft, ChevronsRight, LogOut, Cog
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { logout } from '../../services/authService';

const MAIN_TABS = [
    { id: 'dashboard', path: '/', label: 'Painel', icon: LayoutDashboard, scope: 'Dashboard', description: 'Visão geral da operação com KPIs, status do sistema e atalhos.' },
    { id: 'initializer', path: '/initializer', label: 'Initializer', icon: Cpu, scope: 'Initializer', description: 'Sincronização e boot cognitivo do ecossistema AtlasAI.' },
    { id: 'executive', path: '/executive', label: 'Diretoria', icon: BarChartHorizontal, scope: 'ExecutiveDashboard', description: 'Visão consolidada dos indicadores estratégicos do Olie Hub.' },
    { id: 'analytics', path: '/analytics', label: 'Analytics', icon: BarChart2, scope: 'Analytics', description: 'Painéis e relatórios de desempenho do Olie Hub.' },
    { id: 'orders', path: '/orders', label: 'Pedidos', icon: ShoppingCart, scope: 'Orders', description: 'Gerencie e acompanhe todos os pedidos da sua loja.' },
    { id: 'production', path: '/production', label: 'Produção', icon: Workflow, scope: 'Production', description: 'Controle o chão de fábrica, da matéria-prima ao produto acabado.' },
    { id: 'inventory', path: '/inventory', label: 'Estoque', icon: Package, scope: 'Inventory', description: 'Consulte saldos, movimentações e transferências entre armazéns.' },
    { id: 'purchases', path: '/purchases', label: 'Compras', icon: ShoppingBasket, scope: 'Purchases', description: 'Gerencie fornecedores e pedidos de compra de materiais.' },
    { id: 'logistics', path: '/logistics', label: 'Logística', icon: Truck, scope: 'Logistics', description: 'Gerencie o fluxo de separação, embalagem e expedição.' },
    { id: 'finance', path: '/finance', label: 'Financeiro', icon: DollarSign, scope: 'Finance', description: 'Gerencie contas, transações, e o fluxo de caixa.' },
    { id: 'omnichannel', path: '/omnichannel', label: 'Omnichannel', icon: MessagesSquare, scope: 'Omnichannel', description: 'Central de comunicação com o cliente em múltiplos canais.' },
    { id: 'marketing', path: '/marketing', label: 'Marketing', icon: Megaphone, scope: 'Marketing', description: 'Gerencie campanhas, segmente públicos e analise resultados.' },
    { id: 'contacts', path: '/contacts', label: 'Contatos', icon: Users, scope: 'Contacts', description: 'Gerencie seus clientes e fornecedores.' },
    { id: 'products', path: '/products', label: 'Produtos', icon: Package, scope: 'Products', description: 'Gerencie produtos, variações e os dados mestres do catálogo.' },
    { id: 'settings', path: '/settings', label: 'Sistema', icon: Settings, scope: 'Settings', description: 'Gerencie parâmetros globais, integrações e segurança da plataforma.' },
    // Adding the new general settings route, reusing Settings scope for now or define a new one if needed
    { id: 'system-config', path: '/system-config', label: 'Config. Gerais', icon: Cog, scope: 'Settings', description: 'Ajustes básicos do sistema como nome e fuso horário.' },
];

export const MainLayout: React.FC = () => {
    const { user, activeModule, setActiveModule } = useApp();
    const { can } = useOlie();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Sincronizar activeModule com a rota atual para manter compatibilidade com o contexto
    useEffect(() => {
        const currentTab = MAIN_TABS.find(tab => tab.path === location.pathname);
        if (currentTab && currentTab.id !== activeModule) {
            setActiveModule(currentTab.id);
        }
    }, [location.pathname, setActiveModule, activeModule]);

    const handleNavigation = (path: string, id: string) => {
        navigate(path);
        setActiveModule(id);
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Failed to log out', error);
        }
    };

    if (!user) return null;

    const visibleTabs = MAIN_TABS.filter(tab => can(tab.scope, 'read'));
    const currentTab = MAIN_TABS.find(t => t.id === activeModule) || MAIN_TABS[0];

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
                                onClick={() => handleNavigation(tab.path, tab.id)}
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
                        <h2 className="text-xl font-semibold">{currentTab.label}</h2>
                        <p className="text-sm text-textSecondary dark:text-dark-textSecondary">{currentTab.description}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <NotificationBell />
                        <ThemeToggle />
                        <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center font-semibold text-sm" title={user.email}>
                            {user.email.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </header>
                <div className="flex-1 overflow-y-auto p-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
