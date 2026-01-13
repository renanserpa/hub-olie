import React from 'react';
import { AnalyticsKPI } from '../../types';
import AnalyticsDashboard from '../executive/AnalyticsDashboard';

interface MarketingMetricsProps {
    kpis: AnalyticsKPI[];
    aiData: any;
}

const MarketingMetrics: React.FC<MarketingMetricsProps> = ({ kpis, aiData }) => {
    return <AnalyticsDashboard kpis={kpis} aiData={aiData} moduleName="Marketing" />;
};

export default MarketingMetrics;