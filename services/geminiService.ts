import { ExecutiveKPI } from "../types";
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
};

export async function geminiGenerate(context: string, payload: any) {
  aiDisabledError();
  // This will be caught by the orchestrator and logged.
  return `Relatório para ${context} desabilitado.`;
}