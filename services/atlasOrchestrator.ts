import orchestration from '../schemas/ai_orchestration_map.json';
import { executeAgent } from '../hub-initializer/services/crewSyncService';
import { geminiGenerate } from './geminiService';
import { pushLogs } from '../hub-initializer/services/supabaseSyncService';

export async function orchestrateCommand(command: string) {
  const match = Object.keys(orchestration).find(k => command.toLowerCase().includes(k));
  if (!match) return console.warn(`[ATLASAI] Comando não reconhecido: ${command}`);

  const config = (orchestration as any)[match];
  const { route, context, action, report } = config;

  console.log(`[ATLASAI] 🚀 Executando rota: ${route.join(" → ")}`);

  for (const agent of route) {
    await executeAgent(agent, { context, action, report });
  }

  await geminiGenerate(context, { action, report });
  await pushLogs(context);

  console.log(`[ATLASAI] ✅ Execução concluída: ${command}`);
}
