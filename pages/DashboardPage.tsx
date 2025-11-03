import React from 'react';
import { useDashboard } from '../hooks/useDashboard';
import { Loader2, ShoppingCart, Users, Package, Workflow } from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import ActivityFeedCard from '../components/dashboard/RecentActivityCard';
import FinancialSummaryCard from '../components/dashboard/FinancialSummaryCard';

const DashboardPage: React.FC = () => {
    const { isLoading, stats, financeSummary, activityFeed } = useDashboard();

    if (isLoading) {
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
                <p className="text-textSecondary mt-1">Visão geral do seu negócio em tempo real.</p>
            </div>

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
};

export default DashboardPage;