import { GoogleGenAI } from "@google/genai";
import { ExecutiveKPI } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const geminiService = {
  generateDescription: async (name: string, currentDescription?: string): Promise<string> => {
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

  generateExecutiveSummary: async (kpis: ExecutiveKPI[]): Promise<string> => {
    try {
      const kpiSummary = kpis.map(k => `${k.name}: ${k.value} (tendência: ${(k.trend * 100).toFixed(1)}%)`).join('\n');
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
  }
};