import { useState } from 'react'
import { ingestAgentMarkdown, ingestModuleMarkdown } from '../services/crewSyncService'
import { InitializerLog } from '../../types';

export function useInitializer() {
  const [isProcessing, setProcessing] = useState(false)
  const [logs, setLogs] = useState<string[]>([])

  const log = (msg: string) => {
    console.log(msg)
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`])
  }
  
  const addLog = (logData: Omit<InitializerLog, 'id' | 'timestamp'>) => {
      const { agent_name, action, status } = logData;
      log(`[${agent_name}] [${status.toUpperCase()}] ${action}`);
  };


  const handleUpload = async (files: FileList) => {
    setProcessing(true)
    log('[INITIALIZER] Ingestão iniciada...')
    for (const file of Array.from(files)) {
      if (!file.name.endsWith('.md')) continue
      if (file.name.includes('_v')) await ingestModuleMarkdown(file, addLog)
      else await ingestAgentMarkdown(file, addLog)
    }
    log('[SYSTEM] Ingestão concluída.')
    setProcessing(false)
  }

  return { handleUpload, isProcessing, logs }
}
