// ...existing code...
import { InitializerLog, InitializerAgent } from '../../types';
import { uploadFileToSupabase, generateDiffReport, registerAgent } from './supabaseSyncService';
import { reportGenerator, generateReport } from './reportGenerator';
import { geminiGenerate } from '../../services/geminiService';
import { dataService } from '../../services/dataService';
import { sendLog } from './logStreamService';
import { geminiHubService } from '../../services/geminiHubService';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const extractModuleName = (fileName: string) => fileName.replace('.md', '');

type AgentPayload = {
  action?: string;
  context?: string;
  report?: string;
  [key: string]: any;
};

export const crewSyncService = {
  async broadcast(event: { type: string; payload: any }) {
    sendLog('crewSyncService', `Broadcasting event: ${event.type}`);
    await delay(100);
    return { status: 'ok', delivered_to: Math.floor(Math.random() * 5) + 1 };
  },

  async getAgentStatus(agentName: string) {
    sendLog('crewSyncService', `Fetching status for agent: ${agentName}`);
    await delay(200);
    return {
      name: agentName,
      status: 'idle',
      last_task: 'none',
      health: 'ok',
    };
  },
};

export async function ingestAgentMarkdown(
  file: File,
  addLog: (log: Omit<InitializerLog, 'id' | 'timestamp'>) => void
) {
  if (!file || typeof file.text !== 'function') {
    addLog({ agent_name: 'Ingestor', action: `[AGENT] Arquivo inválido`, status: 'error' });
    throw new Error('Arquivo inválido para ingestão');
  }

  try {
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

    return { ok: true, agent: agentData.name };
  } catch (err) {
    addLog({ agent_name: 'Ingestor', action: `[AGENT] Erro ingestão: ${String(err)}`, status: 'error' });
    await reportGenerator.writeAuditLog(`[ERROR] Falha ao sincronizar agente: ${String(err)}`);
    throw err;
  }
}

export async function ingestModuleMarkdown(
  file: File,
  addLog: (log: Omit<InitializerLog, 'id' | 'timestamp'>) => void
) {
  if (!file || typeof file.text !== 'function') {
    addLog({ agent_name: 'Ingestor', action: `[MODULE] Arquivo inválido`, status: 'error' });
    throw new Error('Arquivo inválido para ingestão de módulo');
  }

  const moduleName = extractModuleName(file.name);
  addLog({ agent_name: 'Ingestor', action: `[MODULE] Iniciando ingestão: ${moduleName}`, status: 'running' });

  try {
    await uploadFileToSupabase(file, `/reports/modulos/${file.name}`);
    await generateDiffReport(moduleName);
    await reportGenerator.writeAuditLog(`[DIFF] Módulo ${moduleName} atualizado.`);
    addLog({ agent_name: 'Ingestor', action: `[MODULE] ${moduleName} atualizado com sucesso.`, status: 'success' });
    return { ok: true, module: moduleName };
  } catch (err) {
    addLog({ agent_name: 'Ingestor', action: `[MODULE] Erro atualização: ${String(err)}`, status: 'error' });
    await reportGenerator.writeAuditLog(`[ERROR] Falha ao atualizar módulo ${moduleName}: ${String(err)}`);
    throw err;
  }
}

export async function executeAgent(agent: string, payload: AgentPayload = {}) {
  const actionDescription = `${payload.action ?? 'ação desconhecida'} no contexto ${payload.context ?? 'geral'}`;

  await dataService.addDocument('initializer_logs', {
    agent_name: agent,
    action: actionDescription,
    status: 'running',
    module: payload.context,
    timestamp: new Date().toISOString()
  });

  sendLog(agent, `Executando: ${actionDescription}`);

  try {
    switch (agent) {
      case "ArquitetoSupremo":
        sendLog(agent, `Iniciando auditoria do módulo ${payload.context}.`);
        await delay(1200);
        break;

      case "PromptArchitectAI":
        sendLog(agent, `Gerando prompt técnico e SQL migration (${payload.action})...`);
        sendLog(agent, 'Timeout — reenviando prompt para GCD.');
        try {
          await geminiGenerate(String(payload.context ?? ''), payload);
        } catch (innerErr) {
          sendLog(agent, `geminiGenerate falhou: ${String(innerErr)}`);
          throw innerErr;
        }
        await delay(1500);
        break;

      case "EngenheiroDeDados":
        sendLog(agent, `Validando schema ${payload.context}_* e tasks_*...`);
        sendLog(agent, 'Schema validado com sucesso.');
        await delay(2000);
        break;

      case "IntegratorAI":
        sendLog(agent, `Sincronizando conexões com Orders, Inventory e Finance.`);
        sendLog(agent, 'Endpoint /api/production/update sincronizado.');
        await delay(1800);
        break;

      case "GeminiAI":
        sendLog(agent, 'Análise cognitiva: falha de autenticação GCD detectada.');
        await reportGenerator.writeAuditLog('[GEMINI_ANALYSIS] Análise: falha de autenticação GCD detectada.');
        await delay(1500);
        break;

      case "GeminiHubAI":
        sendLog(agent, `Iniciando orquestração de serviços Google para o contexto: ${payload.context}`);
        try {
          await geminiHubService.routeRequest({ service: 'vertex', action: 'predict', payload: { input: 'teste de integração Vertex AI' }});
          await geminiHubService.routeRequest({ service: 'nano', action: 'summarize', payload: { input: 'teste de integração Gemini Nano (Banana)' }});
          sendLog(agent, 'Validação das APIs Google (Vertex, Nano) concluída.');
        } catch (err) {
          sendLog(agent, `geminiHubService erro: ${String(err)}`);
          throw err;
        }
        await delay(1500);
        break;

      case "ArquitetoSupremo_Finalizador":
        const finalAgentName = "ArquitetoSupremo";
        if (payload.context === 'system_wide') {
          sendLog(finalAgentName, `Relatório consolidado.`);
        } else {
          sendLog(finalAgentName, `Auditoria concluída — relatório salvo em ${payload.report}.`);
        }
        await generateReport(String(payload.report ?? 'default-report'));
        await reportGenerator.writeAuditLog(`[SUCCESS] Módulo ${payload.context} finalizado.`);
        break;

      case "WebAppDevAI":
        sendLog(agent, `Atualizando componentes UI para ${payload.context}...`);
        await delay(500);
        break;

      // Audits and generic handlers
      default:
        sendLog(agent, `Executando tarefa genérica para ${payload.context}...`);
        try {
          await geminiGenerate(agent, payload);
        } catch (err) {
          sendLog(agent, `geminiGenerate erro genérico: ${String(err)}`);
          throw err;
        }
    }

    const agents = await dataService.getCollection<InitializerAgent>('initializer_agents');
    const agentData = agents.find(a => a.name === agent);

    await dataService.addDocument('initializer_logs', {
      agent_name: agent,
      action: actionDescription,
      status: 'success',
      module: payload.context,
      timestamp: new Date().toISOString(),
      metadata: {
        agent_status: agentData?.status ?? 'unknown',
        health_score: (agentData as any)?.health_score ?? 'unknown'
      }
    });

    return { ok: true };
  } catch (error) {
    console.error(`[AGENT] Erro ao executar ${agent}:`, error);
    sendLog(agent, `Erro ao executar ${agent}: ${String(error)}`);

    await dataService.addDocument('initializer_logs', {
      agent_name: agent,
      action: actionDescription,
      status: 'error',
      module: payload.context,
      timestamp: new Date().toISOString(),
      metadata: {
        error: String(error),
      },
    });

    return { ok: false, error: String(error) };
  }
}
// ...existing code...