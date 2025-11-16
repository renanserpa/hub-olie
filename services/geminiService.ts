import { ExecutiveKPI as _ExecutiveKPI, SystemSetting } from "../types";
import { toast } from '../hooks/use-toast';

const aiDisabledError = () => {
    const errorMessage = "Funcionalidade de IA (Gemini) está temporariamente desabilitada.";
    console.warn(errorMessage);
    toast({ title: 'IA Desabilitada', description: 'Esta funcionalidade está temporariamente indisponível.', variant: 'destructive' });
    throw new Error(errorMessage);
};

export const geminiService = {
  generateDescription: async (name: string, currentDescription?: string): Promise<string> => {
    aiDisabledError();
    // Return a non-breaking fallback
    return currentDescription || `Descrição para ${name}`;
  },

  generateCampaignDescription: async (campaignName: string, campaignObjective: string): Promise<string> => {
    aiDisabledError();
    // Return a non-breaking fallback
    return `Descrição para a campanha ${campaignName}`;
  },

  generateSystemOptimizations: async (kpis: any[], settings: SystemSetting[]): Promise<any[]> => {
    // This is a mock implementation to demonstrate the feature as per Idea #005
    console.log("[Gemini Service] Generating system optimizations based on:", { kpis, settings });
    await new Promise(res => setTimeout(res, 1500)); // Simulate AI processing

    const suggestion = {
      key: "freight_params",
      newValue: {
          radius_km: 15,
          base_fee: 12,
          fee_per_km: 2.8,
          free_shipping_threshold: 350,
      },
      confidence: 0.95,
      explanation: `O custo médio de frete aumentou 15%. Sugerimos ajustar o raio e o valor para frete grátis para otimizar a conversão.`,
    };

    return [suggestion];
  },
};

export async function geminiGenerate(context: string, payload: any) {
  aiDisabledError();
  // This will be caught by the orchestrator and logged.
  return `Relatório para ${context} desabilitado.`;
}
