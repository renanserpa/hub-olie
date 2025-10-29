





import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AppData, User } from './types';
import Toaster from './components/Toaster';
import { toast } from './hooks/use-toast';
import { ShoppingCart, Settings, Workflow, MessagesSquare, Package, Users, Bell, ShieldAlert, Truck } from 'lucide-react';
import { Button } from './components/ui/Button';
import OrdersPage from './components/OrdersPage';
import ProductionPage from './components/ProductionPage';
import OmnichannelPage from './components/OmnichannelPage';
import InventoryPage from './components/InventoryPage';
import ContactsPage from './components/ContactsPage';
import ProductsPage from './components/ProductsPage';
import SettingsPage from './components/SettingsPage';
import LogisticsPage from './components/LogisticsPage';
import { cn } from './lib/utils';
import { useAuth } from './context/AuthContext';
import LoginPage from './components/LoginPage';
import type { UserRole } from './services/authService';
import { logout } from './services/authService';
import { isSandbox } from './lib/runtime';
import { dataService } from './services/dataService';


const MAIN_TABS = [
    { id: 'orders', label: 'Pedidos', icon: ShoppingCart },
    { id: 'production', label: 'Produção', icon: Workflow },
    { id: 'inventory', label: 'Estoque', icon: Package },
    { id: 'logistics', label: 'Logística', icon: Truck },
    { id: 'omnichannel', label: 'Omnichannel', icon: MessagesSquare },
    { id: 'contacts', label: 'Contatos', icon: Users },
    { id: 'products', label: 'Produtos', icon: Package },
    { id: 'settings', label: 'Configurações', icon: Settings },
];

const PAGE_PERMISSIONS: Record<string, UserRole[]> = {
    orders: ['AdminGeral', 'Vendas', 'Administrativo'],
    production: ['AdminGeral', 'Producao'],
    inventory: ['AdminGeral', 'Producao', 'Financeiro'],
    logistics: ['AdminGeral', 'Administrativo'],
    omnichannel: ['AdminGeral', 'Vendas', 'Conteudo'],
    contacts: ['AdminGeral', 'Vendas', 'Administrativo'],
    products: ['AdminGeral', 'Producao', 'Vendas', 'Administrativo'],
    settings: ['AdminGeral', 'Administrativo'],
};

const DEFAULT_PAGE_BY_ROLE: Record<UserRole, string> = {
    AdminGeral: 'orders',
    Producao: 'production',
    Vendas: 'orders',
    Financeiro: 'inventory',
    Administrativo: 'logistics',
    Conteudo: 'omnichannel',
};

const AccessDeniedPage: React.FC<{ role: UserRole }> = ({ role }) => (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-center">
        <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-textPrimary">Acesso Negado</h1>
        <p className="text-textSecondary mt-2">
            Seu perfil de <span className="font-semibold">{role.replace('AdminGeral', 'Admin')}</span> não tem permissão para acessar esta página.
        </p>
    </div>
);

const App: React.FC = () => {
    const { user, isLoading: isAuthLoading, error: authError } = useAuth();
    const [isDataLoading, setIsDataLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [activePage, setActivePage] = useState('orders');
    const hasRedirected = useRef(false);

    useEffect(() => {
        if (user && !isAuthLoading && !hasRedirected.current) {
            const defaultPage = DEFAULT_PAGE_BY_ROLE[user.role];
            if (defaultPage) {
                setActivePage(defaultPage);
            }
            hasRedirected.current = true;
        }
        if (!user && !isAuthLoading) {
            hasRedirected.current = false;
        }
    }, [user, isAuthLoading]);

    useEffect(() => {
        if (!user) {
          setIsDataLoading(false);
          return;
        }
        // Data is now loaded per-page via hooks, so this global load can be removed or simplified.
        // For now, it acts as a simple loading gate.
        setIsDataLoading(true);
        setTimeout(() => setIsDataLoading(false), 200); // Simulate quick load
    }, [user]);

    const renderActivePage = () => {
        if (!user) return null;

        const allowedRoles = PAGE_PERMISSIONS[activePage];
        if (allowedRoles && !allowedRoles.includes(user.role)) {
            return <AccessDeniedPage role={user.role} />;
        }

        switch (activePage) {
            case 'settings':
                return <SettingsPage />;
            case 'production':
                return <ProductionPage />;
            case 'inventory':
                return <InventoryPage />;
            case 'logistics':
                return <LogisticsPage />;
            case 'omnichannel':
                return <OmnichannelPage user={user as User} />;
            case 'contacts':
                return <ContactsPage />;
            case 'products':
                return <ProductsPage />;
            case 'orders':
            default:
                // FIX: Passed the required `user` prop to the OrdersPage component.
                return <OrdersPage user={user} />;
        }
    };
    
    if (isAuthLoading || (user && isDataLoading)) {
        return (
            <div className="flex justify-center items-center h-screen bg-background">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-primary"></div>
                    <p className="mt-4 text-lg font-semibold text-textSecondary">Carregando Olie Hub...</p>
                </div>
            </div>
        );
    }
    
    if (!user) {
        return <LoginPage />;
    }
    
    const visibleTabs = MAIN_TABS.filter(tab => {
        const allowedRoles = PAGE_PERMISSIONS[tab.id];
        return allowedRoles ? allowedRoles.includes(user.role) : false;
    });
    
    return (
        <div className="min-h-screen font-sans bg-background">
            {isSandbox() && (
                <div className="w-full text-center text-xs py-1 bg-amber-100 text-amber-800 border-b border-amber-200 sticky top-0 z-50">
                    SANDBOX MODE (offline) — sem chamadas de rede
                </div>
            )}
            <Toaster />
            <div className="flex">
                <aside className={cn("w-64 bg-secondary border-r border-border h-screen flex flex-col p-4 sticky", isSandbox() ? "top-[25px]" : "top-0")}>
                    <div className="px-2 mb-8">
                        <h1 className="text-xl font-bold text-textPrimary">Olie Hub</h1>
                    </div>
                    <nav className="flex flex-col space-y-2">
                        {visibleTabs.map(tab => (
                            <button key={tab.id} onClick={() => setActivePage(tab.id)}
                                className={cn('flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-colors',
                                    activePage === tab.id ? 'bg-primary text-white' : 'text-textSecondary hover:bg-accent hover:text-textPrimary')}>
                                <tab.icon className="w-5 h-5" />
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </nav>
                     <div className="mt-auto">
                        <Button variant="outline" className="w-full" onClick={logout}>Sair</Button>
                    </div>
                </aside>

                <main className="flex-1">
                     <header className={cn("bg-background/80 backdrop-blur-sm border-b border-border z-10 sticky", isSandbox() ? "top-[25px]" : "top-0")}>
                        <div className="container mx-auto px-6 h-20 flex justify-between items-center">
                           <div className="relative w-full max-w-md">
                           </div>
                            <div className="flex items-center gap-4">
                                <button className="relative text-textSecondary hover:text-textPrimary">
                                    <Bell size={20} />
                                </button>
                                {user && (
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                                            {user.email.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm text-textPrimary truncate">{user.email.split('@')[0]}</p>
                                            <p className="text-xs text-textSecondary">{user.role.replace('AdminGeral', 'Admin')}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </header>
                    <div className="container mx-auto p-4 sm:p-6">
                        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl relative mb-4" role="alert" onClick={() => setError(null)}>{error}</div>}
                        {renderActivePage()}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default App;