import React from 'react';
import { AnalyticsKPI } from '../../types';
import AnalyticsDashboard from '/components/executive/AnalyticsDashboard.tsx';

interface FinancialMetricsProps {
    kpis: AnalyticsKPI[];
    aiData: any;
}

const FinancialMetrics: React.FC<FinancialMetricsProps> = ({ kpis, aiData }) => {
    return <AnalyticsDashboard kpis={kpis} aiData={aiData} moduleName="Financeiro" />;
};

export default FinancialMetrics;
