import React from 'react';
import { AnalyticsKPI } from '../../types';
import KpiCard from '../analytics/KpiCard';
import EmptyState from './EmptyState';
import ChartCard from '../analytics/ChartCard';
import ChartCardForecast from '../analytics/ChartCardForecast';
import { AnomalyData, PredictionData, ForecastData } from '../../hooks/useAnalyticsAI';
import HeatmapPanel from '../analytics/HeatmapPanel';

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
                 {forecastKpi ? (
                    <ChartCardForecast 
                        title={`Previsão IA - ${forecastKpi.name}`}
                        forecast={forecast}
                        unit={forecastKpi.unit}
                    />
                 ) : (
                    <ChartCard title={`Tendência de ${moduleName}`} />
                 )}
                 <HeatmapPanel title={`Clusters de Performance - ${moduleName}`} />
            </div>
        </div>
    );
};

export default AnalyticsDashboard;