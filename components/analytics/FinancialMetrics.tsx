import React from 'react';
import { AnalyticsKPI } from '../../types';
import ModuleMetrics from './ModuleMetrics';

const FinancialMetrics: React.FC<{ kpis: AnalyticsKPI[] }> = ({ kpis }) => {
    return <ModuleMetrics kpis={kpis} moduleName="Financeiro" />;
};
export default FinancialMetrics;
