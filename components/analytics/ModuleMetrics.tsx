import React from 'react';
import { AnalyticsKPI } from '../../types';
import KpiCard from './KpiCard';
import EmptyState from './EmptyState';
import ChartCard from './ChartCard';

interface ModuleMetricsProps {
    kpis: AnalyticsKPI[];
    moduleName: string;
}

const ModuleMetrics: React.FC<ModuleMetricsProps> = ({ kpis, moduleName }) => {
    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {kpis.length > 0 ? (
                    kpis.map(kpi => <KpiCard key={kpi.id} kpi={kpi} />)
                ) : (
                    <div className="col-span-4">
                        <EmptyState title={`Sem KPIs de ${moduleName}`} message="Nenhum indicador de performance encontrado para este módulo."/>
                    </div>
                )}
            </div>
            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
                 <ChartCard title={`Tendência de ${moduleName}`} />
                 <ChartCard title={`Distribuição de ${moduleName}`} />
            </div>
        </div>
    );
};

export default ModuleMetrics;
