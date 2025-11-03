import React, { useState } from 'react';
import { useDashboard } from '../hooks/useDashboard';
import { Loader2, ShoppingCart, Users, Package, Workflow, LayoutDashboard, Sparkles, Cuboid, GitBranch, BarChart } from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import ActivityFeedCard from '../components/dashboard/RecentActivityCard';
import FinancialSummaryCard from '../components/dashboard/FinancialSummaryCard';
import TabLayout from '../components/ui/TabLayout';
import AiHealthMonitorPanel from '../components/dashboard/AiHealthMonitorPanel';
import ColorLabPanel from '../components/dashboard/ColorLabPanel';
import WorkflowPanel from '../components/dashboard/WorkflowPanel';
import PredictiveDashboardPanel from '../components/dashboard/PredictiveDashboardPanel';

const DASHBOARD_TABS = [
    { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'ai_health', label: 'IA & Diagnóstico', icon: Sparkles },
    { id: 'color_lab', label: 'ColorLab 3D', icon: Cuboid },
    { id: 'workflows', label: 'Fluxos Automatizados', icon: GitBranch },
    { id: 'predictive', label: 'Dashboard Preditivo', icon: BarChart },
];

const DashboardPage: React.FC = () => {
    const { isLoading, stats, financeSummary, activityFeed } = useDashboard();
    const [activeTab, setActiveTab] = useState('overview');

    const renderOverview = () => (
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatCard 
                    title="Total de Pedidos"
                    value={stats.orderCount}
                    icon={ShoppingCart}
                    description="Todos os pedidos registrados"
                />
                <StatCard 
                    title="Total de Contatos"
                    value={stats.contactCount}
                    icon={Users}
                    description="Clientes, leads e fornecedores"
                />
                 <StatCard 
                    title="Produtos Cadastrados"
                    value={stats.productCount}
                    icon={Package}
                    description="Itens no seu catálogo"
                />
                 <StatCard 
                    title="OPs em Aberto"
                    value={stats.openProductionOrders}
                    icon={Workflow}
                    description="Ordens de produção ativas"
                />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <ActivityFeedCard 
                    title="Feed de Atividades"
                    activities={activityFeed}
                />
                <FinancialSummaryCard summary={financeSummary} />
            </div>
        </div>
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return renderOverview();
            case 'ai_health':
                return <AiHealthMonitorPanel />;
            case 'color_lab':
                return <ColorLabPanel />;
            case 'workflows':
                return <WorkflowPanel />;
            case 'predictive':
                 return <PredictiveDashboardPanel />;
            default:
                return null;
        }
    };
    
    if (isLoading && activeTab === 'overview') {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-200px)]">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-primary" />
                    <p className="mt-4 text-lg font-semibold text-textSecondary">Carregando painel de controle...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-textPrimary">Painel de Controle</h1>
                <p className="text-textSecondary mt-1">Visão geral do seu negócio em tempo real. — <span className="font-semibold text-primary">FASE III ATIVA</span></p>
            </div>

            <TabLayout tabs={DASHBOARD_TABS} activeTab={activeTab} onTabChange={setActiveTab} />
            
            <div className="mt-4">
                {renderContent()}
            </div>
        </div>
    );
};

export default DashboardPage;