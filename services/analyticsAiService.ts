import { ExecutiveKPI as _ExecutiveKPI, AnalyticsKPI, AnalyticsSnapshot } from "../types";

// Helper for disabled functions
const aiDisabledWarning = (feature: string) => {
    console.warn(`[AI DISABLED] ${feature} is disabled.`);
};

export const analyticsAiService = {
  anomalyDetectorAI: async (kpi: AnalyticsKPI, history: AnalyticsSnapshot[]): Promise<{ isAnomaly: boolean; reason: string; }> => {
    aiDisabledWarning('Anomaly Detector');
    return { isAnomaly: false, reason: 'Análise de IA desabilitada.' };
  },

  trendPredictorAI: async (kpi: AnalyticsKPI, history: AnalyticsSnapshot[]): Promise<{ prediction: number; confidence: string; }> => {
    aiDisabledWarning('Trend Predictor');
    return { prediction: Number(kpi.value), confidence: 'low' }; // Return current value as prediction
  },

  generateForecastInsight: async (kpi: AnalyticsKPI): Promise<{ metric: string; trend: string; confidence: number; insight: string; }> => {
    aiDisabledWarning('Forecast Insight');
    return {
      metric: kpi.name,
      trend: "stable",
      confidence: 0,
      insight: "A análise preditiva por IA está temporariamente desabilitada."
    };
  },

  insightGeneratorAI: async (kpis: (AnalyticsKPI)[]): Promise<string> => {
    aiDisabledWarning('Insight Generator');
    return "* A análise executiva por IA está temporariamente desabilitada.";
  },

  logAnalyzerAI: async (logs: string[]): Promise<string> => {
    aiDisabledWarning('Log Analyzer');
    return "Análise de logs por IA está temporariamente desabilitada.";
  }
};
