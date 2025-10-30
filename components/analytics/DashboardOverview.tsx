import React from 'react';
import { AnalyticsKPI } from '../../types';
import KpiCard from './KpiCard';
import EmptyState from './EmptyState';

interface DashboardOverviewProps {
    kpis: AnalyticsKPI[];
    aiData: {
        anomalies: Record<string, { isAnomaly: boolean; reason: string }>;
    };
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({ kpis, aiData }) => {
    if (kpis.length === 0) {
        return <EmptyState title="Sem Dados" message="Nenhum KPI encontrado. Verifique se a tabela 'analytics_kpis' existe e contém dados." />;
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {kpis.map(kpi => (
                <KpiCard key={kpi.id} kpi={kpi} anomaly={aiData.anomalies[kpi.id]} />
            ))}
        </div>
    );
};

export default DashboardOverview;