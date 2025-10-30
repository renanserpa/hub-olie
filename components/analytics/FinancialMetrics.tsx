import React from 'react';
import { AnalyticsKPI } from '../../types';
import AnalyticsDashboard from './AnalyticsDashboard';

interface FinancialMetricsProps {
    kpis: AnalyticsKPI[];
    aiData: any;
}

const FinancialMetrics: React.FC<FinancialMetricsProps> = ({ kpis, aiData }) => {
    return <AnalyticsDashboard kpis={kpis} aiData={aiData} moduleName="Financeiro" />;
};

export default FinancialMetrics;