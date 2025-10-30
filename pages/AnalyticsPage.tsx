import React, { useMemo } from 'react';
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
import { useAnalyticsAI } from '../hooks/useAnalyticsAI';

const AnalyticsPage: React.FC = () => {
    const { isLoading, kpis, snapshots, activeTab, setActiveTab, kpisByModule } = useAnalytics();
    const { isAiLoading, anomalies, predictions } = useAnalyticsAI(kpis, snapshots);
    
    const aiData = useMemo(() => ({
        isLoading: isAiLoading,
        anomalies,
        predictions,
    }), [isAiLoading, anomalies, predictions]);

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            );
        }
        
        const getKpis = (module: string) => (kpisByModule[module as keyof typeof kpisByModule] || []);

        switch (activeTab) {
            case 'overview':
                return <DashboardOverview kpis={kpis} aiData={aiData} />;
            case 'orders':
                return <SalesMetrics kpis={getKpis('orders')} aiData={aiData} />;
            case 'production':
                return <ProductionMetrics kpis={getKpis('production')} aiData={aiData} />;
            case 'inventory':
                return <InventoryMetrics kpis={getKpis('inventory')} aiData={aiData} />;
            case 'logistics':
                return <LogisticsMetrics kpis={getKpis('logistics')} aiData={aiData} />;
            case 'financial':
                return <FinancialMetrics kpis={getKpis('financial')} aiData={aiData} />;
            case 'marketing':
                return <MarketingMetrics kpis={getKpis('marketing')} aiData={aiData} />;
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