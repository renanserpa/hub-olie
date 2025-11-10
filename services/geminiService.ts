import { GoogleGenAI } from "@google/genai";
import { ExecutiveKPI } from "../types";

// Fix: Property 'env' does not exist on type 'ImportMeta'. Use process.env as per guidelines.
const apiKey = process.env.API_KEY;
// Initialize with an empty string to prevent build failure if the key is not present.
const ai = new GoogleGenAI({ apiKey: apiKey || "" });

// Helper to check for the API key at runtime before making a call.
const ensureApiKey = () => {
    if (!apiKey) {
      // Fix: Update error message to reflect the correct environment variable.
      const errorMessage = "CRITICAL: Gemini API Key (API_KEY) is not configured in the Vercel environment. AI features are disabled.";
      console.error(errorMessage);
      throw new Error('A chave de API do Gemini não está configurada no ambiente.');
    }
};

export const geminiService = {
  generateDescription: async (name: string, currentDescription?: string): Promise<string> => {
    ensureApiKey(); // Check the key before use
    try {
      const prompt = `Você é um especialista em operações de e-commerce para uma marca de luxo.
O nome de um status de pedido é "${name}".
A descrição atual é: "${currentDescription || 'Nenhuma'}".

Gere uma nova descrição curta, clara e profissional para este status. A descrição será usada em uma plataforma interna de operações.
Fale em Português do Brasil. A descrição deve ter no máximo 150 caracteres.
Responda apenas com a descrição gerada, sem formatação extra ou frases como "Aqui está a descrição:".`;

      const response = await ai.models.generateContent({
        model: 'gemini-flash-latest',
        contents: prompt,
      });

      return response.text.trim();
    } catch (error) {
      console.error('Error generating description with Gemini:', error);
      throw new Error('Falha ao gerar descrição com a IA.');
    }
  },

  generateCampaignDescription: async (campaignName: string, campaignObjective: string): Promise<string> => {
    ensureApiKey(); // Check the key before use
    try {
      const prompt = `Você é um especialista em marketing digital para uma marca de luxo.
O nome da campanha é "${campaignName}".
O objetivo é: "${campaignObjective}".

Gere uma descrição interna curta, clara e profissional para esta campanha. A descrição será usada na plataforma de operações para contextualizar a equipe.
Fale em Portugês do Brasil. A descrição deve ter no máximo 200 caracteres.
Responda apenas com a descrição gerada, sem formatação extra ou frases como "Aqui está a descrição:".`;

      const response = await ai.models.generateContent({
        model: 'gemini-flash-latest',
        contents: prompt,
      });

      return response.text.trim();
    } catch (error) {
      console.error('Error generating campaign description with Gemini:', error);
      throw new Error('Falha ao gerar descrição com a IA.');
    }
  },
};

export async function geminiGenerate(context: string, payload: any) {
  ensureApiKey(); // Check the key before use
  const prompt = `
  Gere o relatório completo do módulo ${context}.
  Ação: ${payload.action}.
  Incluir estrutura técnica, SQL, hooks e recomendações.
  Fonte: ${payload.report}.
  `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    const data = response.text;
    console.log(`[GEMINI] 📄 Resposta gerada para ${context}:`, data);
    return data;
  } catch(e) {
      console.error(`[GEMINI] Erro ao gerar resposta para ${context}:`, e);
      return `Erro ao gerar conteúdo para ${context}.`;
  }
}
