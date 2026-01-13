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
    const { isLoading, kpis, activeTab, setActiveTab, kpisByModule, snapshotsByKpi } = useAnalytics();
    const { isAiLoading, anomalies, predictions, forecasts } = useAnalyticsAI(kpis, snapshotsByKpi);
    
    const aiData = useMemo(() => ({
        isLoading: isAiLoading,
        anomalies,
        predictions,
        forecasts,
    }), [isAiLoading, anomalies, predictions, forecasts]);

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
            <AnalyticsTabs activeTab={activeTab} onTabChange={setActiveTab} />
            
            <div className="mt-6">
                {renderContent()}
            </div>
        </div>
    );
};

export default AnalyticsPage;