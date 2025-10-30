import { orchestrateCommand } from '../../services/atlasOrchestrator';
import { sendLog } from './logStreamService';

export async function sendToSupreme(text: string) {
  try {
    sendLog('ArquitetoSupremo', `Recebendo solicitação: "${text}"`);
    console.log(`[SUPREME] Dispatching command: ${text}`);

    await orchestrateCommand(text); // This triggers the whole agent flow

    const result = `[OK] Rota de execução para "${text.slice(0, 80)}..." concluída.`;
    sendLog('ArquitetoSupremo', `Solicitação concluída.`);
    
    return { status: result };
  } catch (err) {
    const errorMessage = `[ERROR] Falha ao processar comando: ${(err as Error).message}`;
    sendLog('ArquitetoSupremo', errorMessage);
    return { status: errorMessage };
  }
}
