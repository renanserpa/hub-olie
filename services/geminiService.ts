import { ExecutiveKPI, SystemSetting } from "../types";
import { toast } from '../hooks/use-toast';
import { externalAIEnabled } from '../lib/featureFlags';

const notifyAIDisabled = (feature = 'Gemini') => {
  const errorMessage = `Funcionalidade de IA (${feature}) está desabilitada por configuração.`;
  console.warn(errorMessage);
  try {
    toast({ title: 'IA Desabilitada', description: 'Esta funcionalidade está temporariamente indisponível.', variant: 'destructive' });
  } catch (e) {
    // toast may not be available in non-UI contexts
  }
};

export const geminiService = {
  generateDescription: async (name: string, currentDescription?: string): Promise<string> => {
    if (!externalAIEnabled()) {
      notifyAIDisabled('Gemini.generateDescription');
      return currentDescription || `Descrição para ${name}`;
    }
    // real AI call would be here; currently disabled to avoid external costs
    return currentDescription || `Descrição para ${name}`;
  },

  generateCampaignDescription: async (campaignName: string, campaignObjective: string): Promise<string> => {
    if (!externalAIEnabled()) {
      notifyAIDisabled('Gemini.generateCampaignDescription');
      return `Descrição para a campanha ${campaignName}`;
    }
    return `Descrição para a campanha ${campaignName}`;
  },

  generateSystemOptimizations: async (kpis: any[], settings: SystemSetting[]): Promise<any[]> => {
    // Local mock that does not call external AI services
    console.log("[Gemini Service] Generating system optimizations (local mock) based on:", { kpis, settings });
    await new Promise(res => setTimeout(res, 1500)); // Simulate processing delay

    const suggestion = {
      key: "freight_params",
      newValue: {
          radius_km: 15,
          base_fee: 12,
          fee_per_km: 2.8,
          free_shipping_threshold: 350,
      },
      confidence: 0.5,
      explanation: `Sugestão gerada localmente sem uso de serviços externos. Revise antes de aplicar.`,
    };

    return [suggestion];
  },
};

export async function geminiGenerate(context: string, payload: any) {
  if (!externalAIEnabled()) {
    notifyAIDisabled('geminiGenerate');
    return `Relatório local (mock) para ${context} — IA externa desabilitada.`;
  }
  // Here would be the actual external call to the AI provider
  return `Relatório para ${context}`;
}