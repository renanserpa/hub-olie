import React from 'react';
import { ExecutiveKPI } from '../../types';
import ExecutiveKpiCard from '../analytics/ExecutiveKpiCard';
import EmptyState from './EmptyState';

interface ExecutiveOverviewProps {
    kpis: ExecutiveKPI[];
}

const ExecutiveOverview: React.FC<ExecutiveOverviewProps> = ({ kpis }) => {
    if (kpis.length === 0) {
        return <EmptyState title="Sem Dados" message="Nenhum KPI executivo encontrado. Verifique a tabela 'executive_kpis'." />;
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {kpis.map(kpi => (
                <ExecutiveKpiCard key={kpi.id} kpi={kpi} />
            ))}
        </div>
    );
};

export default ExecutiveOverview;