import React from 'react';
import { AnalyticsKPI } from '../../types';
import KpiCard from '../analytics/KpiCard';
import EmptyState from './EmptyState';
import { AnomalyData, PredictionData, ForecastData } from '../../hooks/useAnalyticsAI';
import ModuleBarChart from '../analytics/ModuleBarChart';
import ForecastLineChart from '../analytics/ForecastLineChart';

interface AnalyticsDashboardProps {
    kpis: AnalyticsKPI[];
    aiData: {
        isLoading: boolean;
        anomalies: Record<string, AnomalyData>;
        predictions: Record<string, PredictionData>;
        forecasts: Record<string, ForecastData>;
    };
    moduleName: string;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ kpis, aiData, moduleName }) => {
    
    // Find the first available KPI and its prediction for the forecast chart
    const forecastKpi = kpis.find(kpi => aiData.forecasts[kpi.id]);
    const forecast = forecastKpi ? aiData.forecasts[forecastKpi.id] : null;

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {kpis.length > 0 ? (
                    kpis.map(kpi => <KpiCard key={kpi.id} kpi={kpi} anomaly={aiData.anomalies[kpi.id]} />)
                ) : (
                    <div className="col-span-4">
                        <EmptyState title={`Sem KPIs de ${moduleName}`} message="Nenhum indicador de performance encontrado para este módulo."/>
                    </div>
                )}
            </div>
            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
                 {forecastKpi && forecast ? (
                    <ForecastLineChart
                        title={`Previsão IA - ${forecastKpi.name}`}
                        kpi={forecastKpi}
                        forecast={forecast}
                    />
                 ) : (
                    <ModuleBarChart title={`Resumo de KPIs - ${moduleName}`} kpis={kpis} />
                 )}
                 <ModuleBarChart title={`Comparativo de KPIs - ${moduleName}`} kpis={kpis} />
            </div>
        </div>
    );
};

export default AnalyticsDashboard;