import { useState, useEffect } from 'react';
import { AnalyticsKPI, AnalyticsSnapshot } from '../types';
import { analyticsAiService } from '../services/analyticsAiService';

export type AnomalyData = { isAnomaly: boolean; reason: string; };
export type PredictionData = { prediction: number; confidence: string; };
export type ForecastData = { metric: string; trend: string; confidence: number; insight: string; };


export function useAnalyticsAI(kpis: AnalyticsKPI[], snapshotsByKpi: Record<string, AnalyticsSnapshot[]>) {
    const [anomalies, setAnomalies] = useState<Record<string, AnomalyData>>({});
    const [predictions, setPredictions] = useState<Record<string, PredictionData>>({});
    const [forecasts, setForecasts] = useState<Record<string, ForecastData>>({});
    const [isAiLoading, setIsAiLoading] = useState(false);

    useEffect(() => {
        const runAnalysis = async () => {
            if (!kpis.length) return;
            
            setIsAiLoading(true);
            
            const analysisPromises = kpis.map(async (kpi) => {
                const history = snapshotsByKpi[kpi.id] || [];
                if (history.length < 3) {
                    return { 
                        kpiId: kpi.id, 
                        anomaly: { isAnomaly: false, reason: 'Not enough data.' }, 
                        prediction: { prediction: 0, confidence: 'low' },
                        forecast: { metric: kpi.name, trend: 'stable', confidence: 0, insight: 'Dados insuficientes para uma previsão detalhada.' }
                    };
                }
                const [anomalyResult, predictionResult, forecastResult] = await Promise.all([
                    analyticsAiService.anomalyDetectorAI(kpi, history),
                    analyticsAiService.trendPredictorAI(kpi, history),
                    analyticsAiService.generateForecastInsight(kpi),
                ]);
                return { kpiId: kpi.id, anomaly: anomalyResult, prediction: predictionResult, forecast: forecastResult };
            });

            const results = await Promise.all(analysisPromises);
            
            const newAnomalies: Record<string, AnomalyData> = {};
            const newPredictions: Record<string, PredictionData> = {};
            const newForecasts: Record<string, ForecastData> = {};

            results.forEach(res => {
                newAnomalies[res.kpiId] = res.anomaly;
                newPredictions[res.kpiId] = res.prediction;
                newForecasts[res.kpiId] = res.forecast;
            });

            setAnomalies(newAnomalies);
            setPredictions(newPredictions);
            setForecasts(newForecasts);
            setIsAiLoading(false);
        };

        const timeoutId = setTimeout(runAnalysis, 300); // Debounce analysis
        return () => clearTimeout(timeoutId);

    }, [kpis, snapshotsByKpi]);

    return { isAiLoading, anomalies, predictions, forecasts };
}