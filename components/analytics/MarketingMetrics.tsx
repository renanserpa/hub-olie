import React from 'react';
import { AnalyticsKPI } from '../../types';
import ModuleMetrics from './ModuleMetrics';

const MarketingMetrics: React.FC<{ kpis: AnalyticsKPI[] }> = ({ kpis }) => {
    return <ModuleMetrics kpis={kpis} moduleName="Marketing" />;
};
export default MarketingMetrics;
