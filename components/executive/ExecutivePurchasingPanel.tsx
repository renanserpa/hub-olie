import React from 'react';
import { ExecutiveKPI } from '../../types';
import ExecutiveKpiCard from './ExecutiveKpiCard';
import EmptyState from './EmptyState';
import ExecutiveChartCard from './ExecutiveChartCard';

const ExecutivePurchasingPanel: React.FC<{ kpis: ExecutiveKPI[] }> = ({ kpis }) => {
    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {kpis.length > 0 ? (
                    kpis.map(kpi => <ExecutiveKpiCard key={kpi.id} kpi={kpi} />)
                ) : (
                    <div className="col-span-4">
                        <EmptyState title="Sem KPIs de Compras" message="Nenhum indicador encontrado para este módulo."/>
                    </div>
                )}
            </div>
            <div className="grid gap-4">
                 <ExecutiveChartCard title="Tendências de Compras (vs. Trimestre Anterior)" kpis={kpis} />
            </div>
        </div>
    );
};

export default ExecutivePurchasingPanel;