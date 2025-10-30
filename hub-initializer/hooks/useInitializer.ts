import { useState, useCallback, useRef } from 'react';
import { InitializerLog } from '../../types';
import { dataService } from '../../services/dataService';
import { toast } from '../../hooks/use-toast';
import { ingestAgentMarkdown, ingestModuleMarkdown } from '../services/crewSyncService';


const PIPELINE_STEPS = [
  "Criação de Estrutura",
  "Migração SQL",
  "Geração de Hooks e Services",
  "Implementação de Edge Functions",
  "Configuração de Segurança",
  "Validação de Sandbox",
  "Integração com Agentes",
  "Auditoria Final",
];

export function useInitializer() {
  const [logs, setLogs] = useState<InitializerLog[]>([]);
  const [status, setStatus] = useState<'idle' | 'running' | 'done' | 'stopped'>('idle');
  const [currentStep, setCurrentStep] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const pipelineInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const addLog = useCallback((log: Omit<InitializerLog, 'id' | 'timestamp'>) => {
    const newLog = { ...log, id: crypto.randomUUID(), timestamp: new Date().toISOString() };
    setLogs(prev => [newLog, ...prev]);
  }, []);

  const stopPipeline = useCallback(() => {
    if (pipelineInterval.current) {
      clearInterval(pipelineInterval.current);
      pipelineInterval.current = null;
    }
    setStatus('stopped');
    setCurrentStep('');
    addLog({ agent_name: 'Initializer', action: 'Pipeline parado pelo usuário.', status: 'info' });
    toast({ title: 'Pipeline Interrompido' });
  }, [addLog]);

  const runPipeline = useCallback(() => {
    setLogs([]);
    setStatus('running');
    addLog({ agent_name: 'Initializer', action: 'Iniciando pipeline de sincronização...', status: 'info' });

    let stepIndex = 0;

    pipelineInterval.current = setInterval(() => {
      if (stepIndex >= PIPELINE_STEPS.length) {
        if (pipelineInterval.current) clearInterval(pipelineInterval.current);
        setStatus('done');
        setCurrentStep('');
        addLog({ agent_name: 'Initializer', action: 'Pipeline concluído com sucesso.', status: 'success' });
        toast({ title: 'Sincronização Concluída!' });
        return;
      }

      const stepName = PIPELINE_STEPS[stepIndex];
      setCurrentStep(stepName);
      addLog({
        agent_name: 'ArquitetoSupremo',
        module: 'Initializer',
        action: `Executando: ${stepName}`,
        status: 'running',
      });

      // Simulate step completion
      setTimeout(() => {
         addLog({
            agent_name: 'ArquitetoSupremo',
            module: 'Initializer',
            action: `${stepName}: OK`,
            status: 'success',
         });
      }, 500 + Math.random() * 500);

      stepIndex++;
    }, 1500); // Interval between steps
  }, [addLog]);
  
  const handleUpload = async (files: FileList) => {
    setIsProcessing(true);
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
    setIsProcessing(false);
  };

  return { logs, status, currentStep, runPipeline, stopPipeline, isProcessing, handleUpload };
}