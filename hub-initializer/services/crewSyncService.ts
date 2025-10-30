// This service simulates communication with the AtlasAI Crew
import { InitializerLog } from '../../types';
import { uploadFileToSupabase, generateDiffReport, registerAgent } from './supabaseSyncService'
// FIX: `writeAuditLog` is a method on `reportGenerator`, not a named export.
import { reportGenerator } from './reportGenerator'

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// Mock helpers for parsing file content
const parseFrontmatter = (content: string) => ({ name: 'ParsedAgent', role: 'Tester', category: 'Core' });
const extractModuleName = (fileName: string) => fileName.replace('.md', '');

export const crewSyncService = {
  async broadcast(event: { type: string; payload: any }) {
    console.log(`📢 [crewSyncService] Broadcasting event: ${event.type}`, event.payload);
    await delay(100); // Simulate network latency
    return { status: 'ok', delivered_to: Math.floor(Math.random() * 5) + 1 };
  },

  async getAgentStatus(agentName: string) {
    console.log(`📡 [crewSyncService] Fetching status for agent: ${agentName}`);
    await delay(200);
    return {
      name: agentName,
      status: 'idle',
      last_task: 'none',
      health: 'ok',
    };
  },
};

export async function ingestAgentMarkdown(file: File, addLog: (log: Omit<InitializerLog, 'id' | 'timestamp'>) => void) {
  const content = await file.text();
  const agentData = parseFrontmatter(content);
  agentData.name = file.name.replace('.md', ''); // Use filename for simplicity

  addLog({ agent_name: 'Ingestor', action: `[AGENT] Ingerindo ${agentData.name}...`, status: 'running' });
  await registerAgent(agentData.name, agentData.role, agentData.category);

  await uploadFileToSupabase(file, `/reports/agentes/${file.name}`);
  // FIX: Call `writeAuditLog` as a method of `reportGenerator`.
  await reportGenerator.writeAuditLog(`[SYNC] ${agentData.name} sincronizado.`);
  addLog({ agent_name: 'Ingestor', action: `[AGENT] ${agentData.name} sincronizado com sucesso.`, status: 'success' });
}

export async function ingestModuleMarkdown(file: File, addLog: (log: Omit<InitializerLog, 'id' | 'timestamp'>) => void) {
  const moduleName = extractModuleName(file.name);
  addLog({ agent_name: 'Ingestor', action: `[MODULE] Ingerindo ${moduleName}...`, status: 'running' });

  await uploadFileToSupabase(file, `/reports/modulos/${file.name}`);
  await generateDiffReport(moduleName);
  // FIX: Call `writeAuditLog` as a method of `reportGenerator`.
  await reportGenerator.writeAuditLog(`[DIFF] ${moduleName} atualizado.`);
  addLog({ agent_name: 'Ingestor', action: `[MODULE] ${moduleName} atualizado com sucesso.`, status: 'success' });
}
