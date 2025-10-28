
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabaseService } from './services/supabaseService';
import { AppData, SettingsCategory, AnySettingsItem, FieldConfig, User } from './types';
import TabContent from './components/TabContent';
import { Card, CardContent } from './components/ui/Card';
import TabLayout from './components/ui/TabLayout';
import Toaster from './components/Toaster';
import { toast } from './hooks/use-toast';
import { SlidersHorizontal, Upload, Download, Palette, Layers, Truck, Image as ImageIcon, ShoppingCart, Settings, Workflow, MessagesSquare, Package, Search, Bell, Users, ShieldAlert } from 'lucide-react';
import { Button } from './components/ui/Button';
import SystemTabContent from './components/SystemTabContent';
import MediaTabContent from './components/MediaTabContent';
import OrdersPage from './components/OrdersPage';
import ProductionPage from './components/ProductionPage';
import OmnichannelPage from './components/OmnichannelPage';
import InventoryPage from './components/InventoryPage';
import ContactsPage from './components/ContactsPage';
import ProductsPage from './components/ProductsPage';
import { cn } from './lib/utils';


// Auth Imports
import { useAuth } from './context/AuthContext';
import LoginPage from './components/LoginPage';
import type { UserRole } from './services/authService';
import { logout } from './services/authService';


const MAIN_TABS = [
    { id: 'orders', label: 'Pedidos', icon: ShoppingCart },
    { id: 'production', label: 'Produção', icon: Workflow },
    { id: 'inventory', label: 'Estoque', icon: Package },
    { id: 'omnichannel', label: 'Omnichannel', icon: MessagesSquare },
    { id: 'contacts', label: 'Contatos', icon: Users },
    { id: 'products', label: 'Produtos', icon: Package },
    { id: 'settings', label: 'Configurações', icon: Settings },
];

// --- RBAC & REDIRECT LOGIC ---
const PAGE_PERMISSIONS: Record<string, UserRole[]> = {
    orders: ['AdminGeral', 'Vendas', 'Administrativo'],
    production: ['AdminGeral', 'Producao'],
    inventory: ['AdminGeral', 'Producao', 'Financeiro'],
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
    Administrativo: 'settings',
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

// This component was removed as it's not needed for the corrected Settings flow.
// The main App component will handle data loading and passing props.

const App: React.FC = () => {
    const { user, isLoading: isAuthLoading } = useAuth();
    const [settingsData, setSettingsData] = useState<AppData | null>(null);
    const [isDataLoading, setIsDataLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [activePage, setActivePage] = useState('orders');
    const hasRedirected = useRef(false);

    // Effect to handle post-login redirection and reset
    useEffect(() => {
        if (user && !isAuthLoading && !hasRedirected.current) {
            const defaultPage = DEFAULT_PAGE_BY_ROLE[user.role];
            if (defaultPage) {
                setActivePage(defaultPage);
            }
            hasRedirected.current = true;
        }
        if (!user && !isAuthLoading) {
            hasRedirected.current = false; // Reset on logout
        }
    }, [user, isAuthLoading]);

    const loadAppData = useCallback(async () => {
        if (!user) {
            setIsDataLoading(false);
            setSettingsData(null);
            return;
        }
        try {
            setIsDataLoading(true);
            setError(null);
            // This is the single source of truth for initial data loading now.
            const appData = await supabaseService.getSettings();
            setSettingsData(appData);
        } catch (e) {
            const errorMessage = 'Falha ao carregar os dados da aplicação.';
            setError(errorMessage);
            toast({ title: "Erro de Carregamento", description: errorMessage, variant: 'destructive' });
            console.error(e);
        } finally {
            setIsDataLoading(false);
        }
    }, [user]);

    useEffect(() => {
        loadAppData();
    }, [loadAppData]);

    const renderActivePage = () => {
        if (!user) return null;

        const allowedRoles = PAGE_PERMISSIONS[activePage];
        if (allowedRoles && !allowedRoles.includes(user.role)) {
            return <AccessDeniedPage role={user.role} />;
        }

        switch (activePage) {
            // Settings page is no longer a separate component but rendered inside App
            case 'settings':
                return <p>Settings will be implemented here.</p>;
            case 'production':
                return <ProductionPage />;
            case 'inventory':
                return <InventoryPage user={user} />;
            case 'omnichannel':
                return <OmnichannelPage user={user as User} />;
            case 'contacts':
                return <ContactsPage user={user as User} />;
            case 'products':
                return <ProductsPage user={user as User} />;
            case 'orders':
            default:
                return <OrdersPage user={user as User} />;
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
    
    // Filter sidebar tabs based on user role
    const visibleTabs = MAIN_TABS.filter(tab => {
        const allowedRoles = PAGE_PERMISSIONS[tab.id];
        return allowedRoles ? allowedRoles.includes(user.role) : false; // Default to false if no permissions are set
    });
    
    return (
        <div className="min-h-screen font-sans bg-background">
            <Toaster />
            <div className="flex">
                <aside className="w-64 bg-secondary border-r border-border h-screen sticky top-0 flex flex-col p-4">
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
                     <header className="bg-background/80 backdrop-blur-sm border-b border-border sticky top-0 z-10">
                        <div className="container mx-auto px-6 h-20 flex justify-between items-center">
                           <div className="relative w-full max-w-md">
                                {/* Search bar functionality can be implemented here */}
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
