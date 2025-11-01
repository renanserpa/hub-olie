import React from 'react';
import { AnalyticsKPI } from '../../types';
import AnalyticsDashboard from '/components/executive/AnalyticsDashboard.tsx';

interface InventoryMetricsProps {
    kpis: AnalyticsKPI[];
    aiData: any;
}

const InventoryMetrics: React.FC<InventoryMetricsProps> = ({ kpis, aiData }) => {
    return <AnalyticsDashboard kpis={kpis} aiData={aiData} moduleName="Estoque" />;
};

export default InventoryMetrics;
