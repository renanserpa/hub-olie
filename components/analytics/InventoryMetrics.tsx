import React from 'react';
import { AnalyticsKPI } from '../../types';
import ModuleMetrics from './ModuleMetrics';

const InventoryMetrics: React.FC<{ kpis: AnalyticsKPI[] }> = ({ kpis }) => {
    return <ModuleMetrics kpis={kpis} moduleName="Estoque" />;
};
export default InventoryMetrics;
