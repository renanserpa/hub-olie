// This service simulates communication with the AtlasAI Crew
import { InitializerAgent, InitializerLog } from '../../types';
import { uploadFileToSupabase, generateDiffReport, registerAgent } from './supabaseSyncService'
import { reportGenerator } from './reportGenerator'
import { geminiGenerate } from '../../services/geminiService';
import { generateReport } from './reportGenerator';
import { dataService } from '../../services/dataService';


const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// Mock helpers for parsing file content
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
  const agentData = {
      name: content.match(/name:\s*(.+)/)?.[1]?.trim() || file.name.replace('.md', ''),
      role: content.match(/role:\s*(.+)/)?.[1]?.trim() || 'N/A',
      category: content.match(/category:\s*(.+)/)?.[1]?.trim() || 'undefined',
  };

  addLog({ agent_name: 'Ingestor', action: `[AGENT] Iniciando ingestão: ${agentData.name}`, status: 'running' });
  await registerAgent(agentData.name, agentData.role, agentData.category);

  await uploadFileToSupabase(file, `/reports/agentes/${file.name}`);
  await reportGenerator.writeAuditLog(`[SYNC] Agente ${agentData.name} sincronizado.`);
  addLog({ agent_name: 'Ingestor', action: `[AGENT] ${agentData.name} sincronizado com sucesso.`, status: 'success' });
}

export async function ingestModuleMarkdown(file: File, addLog: (log: Omit<InitializerLog, 'id' | 'timestamp'>) => void) {
  const moduleName = extractModuleName(file.name);
  addLog({ agent_name: 'Ingestor', action: `[MODULE] Iniciando ingestão: ${moduleName}`, status: 'running' });

  await uploadFileToSupabase(file, `/reports/modulos/${file.name}`);
  await generateDiffReport(moduleName);
  await reportGenerator.writeAuditLog(`[DIFF] Módulo ${moduleName} atualizado.`);
  addLog({ agent_name: 'Ingestor', action: `[MODULE] ${moduleName} atualizado com sucesso.`, status: 'success' });
}


export async function executeAgent(agent: string, payload: any) {
  const actionDescription = `${payload.action} no contexto ${payload.context}`;
  
  await dataService.addDocument<Omit<InitializerLog, 'id'>>('initializer_logs', {
    agent_name: agent,
    action: actionDescription,
    status: 'running',
    module: payload.context,
    timestamp: new Date().toISOString()
  });

  console.log(`[AGENT] ${agent} executando ${actionDescription}`);

  try {
    switch (agent) {
      case "ArquitetoSupremo":
        await generateReport(payload.report);
        break;
      case "PromptArchitectAI":
        await geminiGenerate(payload.context, payload);
        break;
      case "EngenheiroDeDados":
        console.log("[DB] Aplicando migrações e validação RLS");
        await delay(500);
        break;
      case "WebAppDevAI":
        console.log("[UI] Atualizando componentes e hooks visuais");
        await delay(500);
        break;
      default:
        await geminiGenerate(agent, payload);
    }
    
    const agents = await dataService.getCollection<InitializerAgent>('initializer_agents');
    const agentData = agents.find(a => a.name === agent);

    await dataService.addDocument<Omit<InitializerLog, 'id'>>('initializer_logs', {
      agent_name: agent,
      action: actionDescription,
      status: 'success',
      module: payload.context,
      timestamp: new Date().toISOString(),
      metadata: {
          agent_status: agentData?.status || 'unknown',
          health_score: agentData?.health_score || 'unknown'
      }
    });

  } catch (error) {
    console.error(`[AGENT] Erro ao executar ${agent}:`, error);
    await dataService.addDocument<Omit<InitializerLog, 'id'>>('initializer_logs', {
      agent_name: agent,
      action: actionDescription,
      status: 'error',
      module: payload.context,
      timestamp: new Date().toISOString(),
      metadata: {
        error: (error as Error).message
      }
    });
  }
}