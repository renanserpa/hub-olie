import { GoogleGenAI, Type } from "@google/genai";
import { ExecutiveKPI, AnalyticsKPI, AnalyticsSnapshot } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const anomalySchema = {
  type: Type.OBJECT,
  properties: {
    isAnomaly: { type: Type.BOOLEAN, description: "Whether the last value is considered an anomaly." },
    reason: { type: Type.STRING, description: "A brief explanation for why it is or isn't an anomaly." },
  },
  required: ['isAnomaly', 'reason']
};

const trendSchema = {
    type: Type.OBJECT,
    properties: {
        prediction: { type: Type.NUMBER, description: "The predicted value for the next period." },
        confidence: { type: Type.STRING, enum: ['high', 'medium', 'low'], description: "The confidence level of the prediction." },
    },
    required: ['prediction', 'confidence']
};

export const analyticsAiService = {
  anomalyDetectorAI: async (kpi: AnalyticsKPI, history: AnalyticsSnapshot[]): Promise<{ isAnomaly: boolean; reason: string; }> => {
    const historyValues = history.map(s => s.value).join(', ');
    const prompt = `You are a data scientist. Given a time series of a KPI ending with the current value, determine if the last value is an anomaly. An anomaly is a significant deviation (e.g., > 2 standard deviations from the mean of the historical data, or a >20% change from the previous value).
    KPI Name: "${kpi.name}"
    Historical Data (oldest to newest): [${historyValues}]
    Current Value: ${kpi.value}
    
    Is the current value an anomaly? Respond ONLY with JSON.`;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-flash-latest',
            contents: prompt,
            config: { responseMimeType: "application/json", responseSchema: anomalySchema },
        });
        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error(`AI Anomaly Detection failed for KPI ${kpi.name}:`, error);
        return { isAnomaly: false, reason: 'AI analysis failed.' };
    }
  },

  trendPredictorAI: async (kpi: AnalyticsKPI, history: AnalyticsSnapshot[]): Promise<{ prediction: number; confidence: string; }> => {
    const historyValues = history.map(s => s.value).join(', ');
    const prompt = `You are a data scientist. Given the following time series data for the KPI "${kpi.name}", perform a simple linear regression to predict the single next value in the series. Also, state your confidence level based on the data's stability.
    Data (oldest to newest): [${historyValues}, ${kpi.value}]
    
    Respond ONLY with JSON.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-flash-latest',
            contents: prompt,
            config: { responseMimeType: "application/json", responseSchema: trendSchema },
        });
        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error(`AI Trend Prediction failed for KPI ${kpi.name}:`, error);
        return { prediction: 0, confidence: 'low' };
    }
  },

  insightGeneratorAI: async (kpis: (ExecutiveKPI | AnalyticsKPI)[]): Promise<string> => {
    try {
      const kpiSummary = kpis.map(k => `${k.name}: ${k.value} (tendência: ${k.trend ? (k.trend * 100).toFixed(1) + '%' : 'N/A'})`).join('\n');
      const prompt = `Você é um consultor de negócios sênior (C-level) analisando os KPIs trimestrais da marca de luxo "Olie".
Os dados são:
${kpiSummary}

Gere um resumo executivo conciso em bullet points (use *).
O resumo deve:
1.  Identificar o resultado mais positivo.
2.  Identificar o maior ponto de atenção ou risco.
3.  Sugerir uma ação estratégica com base na análise.
Fale em Português do Brasil. Seja direto e profissional. A resposta deve conter no máximo 3 bullet points.`;

      const response = await ai.models.generateContent({
        model: 'gemini-flash-latest',
        contents: prompt,
      });

      return response.text.trim();
    } catch (error)      {
      console.error('Error generating executive summary with Gemini:', error);
      throw new Error('Falha ao gerar análise com a IA.');
    }
  },

  logAnalyzerAI: async (logs: string[]): Promise<string> => {
    const logData = logs.join('\n');
    const prompt = `You are GeminiAI, an expert AI system auditor. Analyze the following execution logs from the AtlasAI Crew. Identify the root cause of any failures and suggest corrective actions.
    Logs:
    ---
    ${logData}
    ---
    Provide a concise analysis in markdown format with:
    - Root Cause Analysis
    - Recommended Actions`;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-flash-latest',
            contents: prompt,
        });

        return response.text.trim();
    } catch (error) {
        console.error('Error analyzing logs with Gemini:', error);
        throw new Error('Falha ao analisar logs com a IA.');
    }
  }
};