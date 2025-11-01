import React from 'react';
import { AnalyticsKPI } from '../../types';
import AnalyticsDashboard from '../executive/AnalyticsDashboard';

interface SalesMetricsProps {
    kpis: AnalyticsKPI[];
    aiData: any;
}

const SalesMetrics: React.FC<SalesMetricsProps> = ({ kpis, aiData }) => {
    return <AnalyticsDashboard kpis={kpis} aiData={aiData} moduleName="Vendas" />;
};

export default SalesMetrics;