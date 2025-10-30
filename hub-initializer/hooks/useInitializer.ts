import { useState } from 'react'
import { ingestAgentMarkdown, ingestModuleMarkdown } from '../services/crewSyncService'
import { InitializerLog } from '../../types';
import { sendLog } from '../services/logStreamService';

export function useInitializer() {
  const [isProcessing, setProcessing] = useState(false)

  const log = (msg: string) => {
    console.log(msg)
    sendLog('INITIALIZER', msg.replace('[INITIALIZER] ', ''));
  }
  
  const addLog = (logData: Omit<InitializerLog, 'id' | 'timestamp'>) => {
      const { agent_name, action, status } = logData;
      sendLog(agent_name, `[${status.toUpperCase()}] ${action}`);
  };


  const handleUpload = async (files: FileList) => {
    setProcessing(true)
    log('[INITIALIZER] Ingestão iniciada...')
    for (const file of Array.from(files)) {
      if (!file.name.endsWith('.md')) continue
      if (file.name.includes('_v')) await ingestModuleMarkdown(file, addLog)
      else await ingestAgentMarkdown(file, addLog)
    }
    log('[INITIALIZER] Ingestão concluída.')
    setProcessing(false)
  }

  return { handleUpload, isProcessing }
}
