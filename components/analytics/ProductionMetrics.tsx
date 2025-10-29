import React from 'react';
import { AnalyticsKPI } from '../../types';
import ModuleMetrics from './ModuleMetrics';

const ProductionMetrics: React.FC<{ kpis: AnalyticsKPI[] }> = ({ kpis }) => {
    return <ModuleMetrics kpis={kpis} moduleName="Produção" />;
};
export default ProductionMetrics;
