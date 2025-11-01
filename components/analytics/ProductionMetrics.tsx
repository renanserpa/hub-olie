import React from 'react';
import { AnalyticsKPI } from '../../types';
import AnalyticsDashboard from '/components/executive/AnalyticsDashboard.tsx';

interface ProductionMetricsProps {
    kpis: AnalyticsKPI[];
    aiData: any;
}

const ProductionMetrics: React.FC<ProductionMetricsProps> = ({ kpis, aiData }) => {
    return <AnalyticsDashboard kpis={kpis} aiData={aiData} moduleName="Produção" />;
};

export default ProductionMetrics;
