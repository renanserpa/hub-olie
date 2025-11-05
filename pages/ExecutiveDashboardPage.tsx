import React from 'react';
import { useExecutiveDashboard } from '../hooks/useExecutiveDashboard';
import { BarChartHorizontal, Loader2 } from 'lucide-react';
import ExecutiveTabs from '../components/executive/ExecutiveTabs';
import ExecutiveOverview from '../components/executive/ExecutiveOverview';
import ExecutiveFinancialPanel from '../components/executive/ExecutiveFinancialPanel';
import ExecutiveProductionPanel from '../components/executive/ExecutiveProductionPanel';
import ExecutiveSalesPanel from '../components/executive/ExecutiveSalesPanel';
import ExecutiveLogisticsPanel from '../components/executive/ExecutiveLogisticsPanel';
import ExecutivePurchasingPanel from '../components/executive/ExecutivePurchasingPanel';
import ExecutiveAIInsights from '../components/analytics/ExecutiveAIInsights';

const ExecutiveDashboardPage: React.FC = () => {
    const { isLoading, kpis, insights, activeTab, setActiveTab } = useExecutiveDashboard();

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
                return <ExecutiveOverview kpis={kpis} />;
            case 'financial':
                return <ExecutiveFinancialPanel kpis={kpis.filter(k => k.module === 'financial')} />;
            case 'production':
                return <ExecutiveProductionPanel kpis={kpis.filter(k => k.module === 'production')} />;
            case 'sales':
                return <ExecutiveSalesPanel kpis={kpis.filter(k => k.module === 'sales')} />;
            case 'logistics':
                return <ExecutiveLogisticsPanel kpis={kpis.filter(k => k.module === 'logistics')} />;
            case 'purchasing':
                return <ExecutivePurchasingPanel kpis={kpis.filter(k => k.module === 'purchasing')} />;
            case 'ai_insights':
                return <ExecutiveAIInsights insights={insights} kpis={kpis} />;
            default:
                 return <div className="text-center p-8">Em desenvolvimento.</div>;
        }
    };

    return (
        <div>
            <ExecutiveTabs activeTab={activeTab} onTabChange={setActiveTab} />
            
            <div className="mt-6">
                {renderContent()}
            </div>
        </div>
    );
};

export default ExecutiveDashboardPage;