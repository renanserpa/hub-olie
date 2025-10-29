import React from 'react';
import { AnalyticsKPI } from '../../types';
import ModuleMetrics from './ModuleMetrics';

const SalesMetrics: React.FC<{ kpis: AnalyticsKPI[] }> = ({ kpis }) => {
    return <ModuleMetrics kpis={kpis} moduleName="Vendas" />;
};
export default SalesMetrics;
