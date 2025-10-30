import { useState, useCallback, useRef } from 'react';
import { InitializerLog } from '../../types';
import { toast } from '../../hooks/use-toast';
import { ingestAgentMarkdown, ingestModuleMarkdown } from '../services/crewSyncService';


export function useInitializer() {
  const [logs, setLogs] = useState<InitializerLog[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const addLog = useCallback((log: Omit<InitializerLog, 'id' | 'timestamp'>) => {
    const newLog = { ...log, id: crypto.randomUUID(), timestamp: new Date().toISOString() };
    setLogs(prev => [newLog, ...prev]);
  }, []);

  const handleUpload = async (files: FileList) => {
    setIsProcessing(true);
    setLogs([]); // Clear logs for new session
    addLog({ agent_name: 'Initializer', action: `Recebidos ${files.length} arquivos para processamento.`, status: 'info' });

    for (const file of Array.from(files)) {
      if (file.name.endsWith('.md')) {
        try {
          if (file.name.includes('_v')) {
            await ingestModuleMarkdown(file, addLog);
          } else {
            await ingestAgentMarkdown(file, addLog);
          }
        } catch (error) {
           const errorMessage = (error as Error).message;
           addLog({ agent_name: 'Initializer', action: `Erro ao processar ${file.name}: ${errorMessage}`, status: 'error' });
           toast({ title: `Erro no arquivo ${file.name}`, description: errorMessage, variant: 'destructive' });
        }
      }
    }
    
    addLog({ agent_name: 'Initializer', action: 'Processamento de arquivos concluído.', status: 'success' });
    toast({ title: "Sincronização Concluída!"});
    setIsProcessing(false);
  };

  return { logs, isProcessing, handleUpload };
}