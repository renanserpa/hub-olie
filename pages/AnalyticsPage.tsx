import React from 'react';
import { useAnalytics } from '../hooks/useAnalytics';
import { BarChart2, Loader2 } from 'lucide-react';
import AnalyticsTabs from '../components/analytics/AnalyticsTabs';
import DashboardOverview from '../components/analytics/DashboardOverview';
import SalesMetrics from '../components/analytics/SalesMetrics';
import ProductionMetrics from '../components/analytics/ProductionMetrics';
import InventoryMetrics from '../components/analytics/InventoryMetrics';
import LogisticsMetrics from '../components/analytics/LogisticsMetrics';
import FinancialMetrics from '../components/analytics/FinancialMetrics';
import MarketingMetrics from '../components/analytics/MarketingMetrics';

const AnalyticsPage: React.FC = () => {
    const { isLoading, kpis, activeTab, setActiveTab } = useAnalytics();

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            );
        }
        
        switch (activeTab) {
            case 'overview':
                return <DashboardOverview kpis={kpis} />;
            case 'orders':
                return <SalesMetrics kpis={kpis.filter(k => k.module === 'orders')} />;
            case 'production':
                return <ProductionMetrics kpis={kpis.filter(k => k.module === 'production')} />;
            case 'inventory':
                return <InventoryMetrics kpis={kpis.filter(k => k.module === 'inventory')} />;
            case 'logistics':
                return <LogisticsMetrics kpis={kpis.filter(k => k.module === 'logistics')} />;
            case 'financial':
                return <FinancialMetrics kpis={kpis.filter(k => k.module === 'financial')} />;
            case 'marketing':
                return <MarketingMetrics kpis={kpis.filter(k => k.module === 'marketing')} />;
            default:
                 return <div className="text-center p-8">Em desenvolvimento.</div>;
        }
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                <div>
                    <div className="flex items-center gap-3">
                        <BarChart2 className="text-primary" size={28} />
                        <h1 className="text-3xl font-bold text-textPrimary">Analytics</h1>
                    </div>
                    <p className="text-textSecondary mt-1">Painéis e relatórios de desempenho do Olie Hub.</p>
                </div>
            </div>
            
            <AnalyticsTabs activeTab={activeTab} onTabChange={setActiveTab} />
            
            <div className="mt-6">
                {renderContent()}
            </div>
        </div>
    );
};

export default AnalyticsPage;
