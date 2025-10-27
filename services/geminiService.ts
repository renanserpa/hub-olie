import { GoogleGenAI } from "@google/genai";

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
};
