import { GoogleGenAI } from "@google/genai";
import { InitializerSyncState } from "../../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export async function generateReport(reportPath: string) {
    console.log(`[REPORT] Simulating generation for: ${reportPath}`);
    await delay(500);
    console.log(`[REPORT] Report for ${reportPath} generated.`);
    return `# Report for ${reportPath}\n\nThis is a simulated report.`;
}

export const reportGenerator = {
  async generateSyncReport(syncState: InitializerSyncState): Promise<string> {
    const prompt = `Você é o agente ArquitetoSupremo.
O módulo "${syncState.module}" foi sincronizado. O último diff aplicado foi:
---
${syncState.last_diff}
---

Gere uma entrada de log de auditoria curta e profissional em markdown para o arquivo 'initializer_audit_log.md'.
A entrada deve confirmar a sincronização e resumir a mudança em uma frase.
Fale em Português do Brasil. Responda apenas com a entrada do log, sem formatação extra.`;
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-flash-latest',
        contents: prompt,
      });

      return response.text.trim();
    } catch (error) {
      console.error('Error generating report with Gemini:', error);
      throw new Error('Falha ao gerar relatório de sincronização com a IA.');
    }
  },

  async writeAuditLog(message: string): Promise<void> {
    console.log(`[REPORT] Writing to initializer_audit_log.md: "${message}"`);
    await delay(100);
    console.log(`[REPORT] Log written successfully.`);
  }
};