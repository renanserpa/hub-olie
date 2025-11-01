import { orchestrateCommand } from '../../services/atlasOrchestrator';
import { sendLog } from './logStreamService';

// Function to extract order number from a command string
const extractOrderNumber = (text: string): string | null => {
  const match = text.match(/OLIE-\d{4}-\d{4,}/i);
  return match ? match[0] : null;
};


export async function sendToSupreme(text: string) {
  try {
    sendLog('ArquitetoSupremo', `Recebendo solicitação: "${text}"`);
    console.log(`[SUPREME] Dispatching command: ${text}`);

    const orderNumber = extractOrderNumber(text);
    const contextOverride = orderNumber ? { orderNumber } : {};

    await orchestrateCommand(text, contextOverride); // Pass context override

    const result = `[OK] Rota de execução para "${text.slice(0, 80)}..." concluída.`;
    sendLog('ArquitetoSupremo', `Solicitação concluída.`);
    
    return { status: result };
  } catch (err) {
    const errorMessage = `[ERROR] Falha ao processar comando: ${(err as Error).message}`;
    sendLog('ArquitetoSupremo', errorMessage);
    return { status: errorMessage };
  }
}