// This service simulates communication with the AtlasAI Crew
import { InitializerAgent, InitializerLog } from '../../types';
import { uploadFileToSupabase, generateDiffReport, registerAgent } from './supabaseSyncService'
import { reportGenerator } from './reportGenerator'
import { geminiGenerate } from '../../services/geminiService';
import { generateReport } from './reportGenerator';
import { dataService } from '../../services/dataService';
import { sendLog } from './logStreamService';
import { geminiHubService } from '../../services/geminiHubService';


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
  
  // FIX: Removed explicit cast to satisfy generic constraints of addDocument.
  await dataService.addDocument<InitializerLog>('initializer_logs', {
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
        sendLog(agent, `Iniciando auditoria do módulo ${payload.context}.`);
        await delay(1200);
        break;
      case "PromptArchitectAI":
        sendLog(agent, `Gerando prompt técnico e SQL migration (${payload.action})...`);
        sendLog(agent, 'Timeout — reenviando prompt para GCD.');
        await geminiGenerate(payload.context, payload);
        await delay(1500);
        break;
      case "EngenheiroDeDados":
        sendLog(agent, `Validando schema ${payload.context}_* e tasks_*...`);
        sendLog(agent, 'Schema validado com sucesso.');
        console.log("[DB] Simulating RLS validation and trigger checks.");
        await delay(2000);
        break;
      case "IntegratorAI": // New agent
        sendLog(agent, `Sincronizando conexões com Orders, Inventory e Finance.`);
        sendLog(agent, 'Endpoint /api/production/update sincronizado.');
        console.log("[INTEGRATOR] Simulating API connection sync.");
        await delay(1800);
        break;
      case "GeminiAI":
        sendLog(agent, 'Análise cognitiva: falha de autenticação GCD detectada.');
        await reportGenerator.writeAuditLog('[GEMINI_ANALYSIS] Análise: falha de autenticação GCD detectada.');
        await delay(1500);
        break;
      case "GeminiHubAI":
        sendLog(agent, `Iniciando orquestração de serviços Google para o contexto: ${payload.context}`);
        await geminiHubService.routeRequest({ service: 'vertex', action: 'predict', payload: { input: 'teste de integração Vertex AI' }});
        await geminiHubService.routeRequest({ service: 'nano', action: 'summarize', payload: { input: 'teste de integração Gemini Nano (Banana)' }});
        sendLog(agent, 'Validação das APIs Google (Vertex, Nano) concluída.');
        await delay(1500);
        break;
      case "ArquitetoSupremo_Finalizador": // New final step for the same agent
        const finalAgentName = "ArquitetoSupremo"; // Log as the original agent
        if (payload.context === 'system_wide') {
            sendLog(finalAgentName, `Relatório consolidado.`);
        } else {
            sendLog(finalAgentName, `Auditoria concluída — relatório salvo em ${payload.report}.`);
        }
        await generateReport(payload.report);
        await reportGenerator.writeAuditLog(`[SUCCESS] Módulo ${payload.context} finalizado.`);
        break;
      case "WebAppDevAI":
        sendLog(agent, `Atualizando componentes UI para ${payload.context}...`);
        console.log("[UI] Atualizando componentes e hooks visuais");
        await delay(500);
        break;
      
      // General Cognitive Audit Agents
      case "AtlasAI_AUDIT":
        sendLog('AtlasAI', 'Roteamento validado.');
        await delay(500);
        break;
      case "GeminiAI_AUDIT":
        sendLog('GeminiAI', 'Enviando prompt de diagnóstico...');
        await delay(1000);
        sendLog('GeminiAI', 'Status 200 — Conexão estável.');
        break;
      case "Vercel_AUDIT":
        sendLog('Vercel', 'Testando status do último build...');
        await delay(600);
        sendLog('Vercel', 'Build ativo (último commit: main).');
        break;
      
      // Existing Audit Flow Agents
      case "SYSTEM_AUDIT_START":
        sendLog('SYSTEM', 'Auditoria iniciada.');
        await delay(1000);
        break;
      case "ArquitetoSupremo_AUDIT":
        sendLog('ArquitetoSupremo', 'Verificando dependências entre agentes...');
        await delay(2000);
        break;
      case "PromptArchitectAI_AUDIT":
        sendLog('PromptArchitectAI', 'Detectado erro de retorno GCD.');
        await delay(1000);
        break;
      case "EngenheiroDeDados_AUDIT":
        if (payload.context === 'system_wide') {
            sendLog('Supabase', 'Trigger audit_production() validado.');
        } else {
            sendLog('EngenheiroDeDados', 'Validação RLS e roles Supabase OK.');
        }
        await delay(2000);
        break;
      case "IntegratorAI_AUDIT":
        sendLog('IntegratorAI', 'Sincronizando endpoints com AI Studio.');
        await delay(2000);
        break;
      case "ArquitetoSupremo_AUDIT_FINISH":
        sendLog('ArquitetoSupremo', 'Auditoria concluída. Causa raiz: falha de comunicação GCD ↔ PromptArchitectAI.');
        await delay(1000);
        break;
      case "SYSTEM_AUDIT_END":
        sendLog('SYSTEM', `Relatório salvo em ${payload.report}`);
        await generateReport(payload.report); // This is a mock, just logs to console
        break;
      
      default:
        sendLog(agent, `Executando tarefa genérica para ${payload.context}...`);
        await geminiGenerate(agent, payload);
    }
    
    const agents = await dataService.getCollection<InitializerAgent>('initializer_agents');
    const agentData = agents.find(a => a.name === agent);

    // FIX: Removed explicit cast to satisfy generic constraints of addDocument.
    await dataService.addDocument<InitializerLog>('initializer_logs', {
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
    sendLog(agent, `ERRO: ${actionDescription} - ${(error as Error).message}`);
    // FIX: Removed explicit cast to satisfy generic constraints of addDocument.
    await dataService.addDocument<InitializerLog>('initializer_logs', {
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
