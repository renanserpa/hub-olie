import { InitializerSyncState } from "../../types";

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export async function generateReport(reportPath: string) {
    console.log(`[REPORT] Simulating generation for: ${reportPath}`);
    await delay(500);
    console.log(`[REPORT] Report for ${reportPath} generated.`);
    return `# Report for ${reportPath}\n\nThis is a simulated report.`;
}

export const reportGenerator = {
  async generateSyncReport(syncState: InitializerSyncState): Promise<string> {
    console.warn("[AI DISABLED] AI Report Generation is disabled.");
    return `Auditoria de sincronização para o módulo "${syncState.module}" concluída. Funcionalidade de IA desabilitada.`;
  },

  async writeAuditLog(message: string): Promise<void> {
    console.log(`[REPORT] Writing to initializer_audit_log.md: "${message}"`);
    await delay(100);
    console.log(`[REPORT] Log written successfully.`);
  }
};