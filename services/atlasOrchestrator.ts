import { executeAgent } from '../hub-initializer/services/crewSyncService';
import { geminiGenerate as _geminiGenerate } from './geminiService';
import { pushLogs as _pushLogs } from '../hub-initializer/services/supabaseSyncService';
import { sendLog } from '../hub-initializer/services/logStreamService';

const orchestrationPromise = fetch('/schemas/ai_orchestration_map.json').then(res => {
    if (!res.ok) {
        throw new Error(`Failed to fetch orchestration map: ${res.statusText}`);
    }
    return res.json();
});

export async function orchestrateCommand(command: string, contextOverride: Record<string, any> = {}) {
  const orchestration = await orchestrationPromise;
  const match = Object.keys(orchestration).find(k => command.toLowerCase().includes(k));
  if (!match) {
    const errorMsg = `Comando não reconhecido: ${command}`;
    sendLog('AtlasAI', `[WARN] ${errorMsg}`);
    console.warn(`[ATLASAI] ${errorMsg}`);
    return;
  }

  const config = (orchestration as any)[match];
  // Merge base context from config with dynamic context from command
  const finalContext = { ...config.context, ...contextOverride };
  const { route, action, report } = config;

  const routeText = `Rota identificada: ${route.join(" → ")}`;
  console.log(`[ATLASAI] 🚀 Executando rota: ${routeText}`);
  sendLog('AtlasAI', routeText);


  for (const agent of route) {
    // Pass the merged context to the agent
    await executeAgent(agent, { context: finalContext, action, report });
  }

  const completionMessage = `Execução concluída para comando: "${command}"`;
  console.log(`[ATLASAI] ✅ ${completionMessage}`);
  sendLog('SYSTEM', `Execução encerrada com status OK.`);
}
