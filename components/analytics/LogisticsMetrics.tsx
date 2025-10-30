import React from 'react';
import { AnalyticsKPI } from '../../types';
import AnalyticsDashboard from './AnalyticsDashboard';

interface LogisticsMetricsProps {
    kpis: AnalyticsKPI[];
    aiData: any;
}

const LogisticsMetrics: React.FC<LogisticsMetricsProps> = ({ kpis, aiData }) => {
    return <AnalyticsDashboard kpis={kpis} aiData={aiData} moduleName="Logística" />;
};

export default LogisticsMetrics;