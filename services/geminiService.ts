const apiKey = process.env.GEMINI_API_KEY ?? process.env.API_KEY ?? "";

export const geminiService = {
  generateDescription: async (name: string, currentDescription?: string): Promise<string> => {
    try {
      const prompt = `Você é um especialista em operações de e-commerce para uma marca de luxo.
O nome de um status de pedido é "${name}".
A descrição atual é: "${currentDescription || 'Nenhuma'}".

Gere uma nova descrição curta, clara e profissional para este status. A descrição será usada em uma plataforma interna de operações.
Fale em Português do Brasil. A descrição deve ter no máximo 150 caracteres.
Responda apenas com a descrição gerada, sem formatação extra ou frases como "Aqui está a descrição:".`;

      if (!apiKey) {
        throw new Error("GEMINI_API_KEY não configurada.");
      }

      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent" +
          `?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        },
      );

      if (!response.ok) {
        const errorPayload = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${errorPayload}`);
      }

      const result = (await response.json()) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      };

      const text = result.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (!text) {
        throw new Error("Gemini API não retornou conteúdo.");
      }

      return text;
    } catch (error) {
      console.error('Error generating description with Gemini:', error);
      throw new Error('Falha ao gerar descrição com a IA.');
    }
  },
};
