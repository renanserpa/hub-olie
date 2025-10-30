import { useState } from 'react'
import { sendToSupreme } from '../services/supremeOrchestrator'
import { reportGenerator } from '../services/reportGenerator'

export function useSupremeCommand() {
  const [isProcessing, setProcessing] = useState(false)
  const [logs, setLogs] = useState<string[]>([])

  const log = (msg: string) => {
    console.log(msg)
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`])
  }

  const sendCommand = async (text: string) => {
    setProcessing(true)
    log(`[COMMAND] Enviando ao ArquitetoSupremo: ${text}`)
    const result = await sendToSupreme(text)
    await reportGenerator.writeAuditLog(`[SUPREME] ${result.status}`)
    log(`[SUPREME] ${result.status}`)
    setProcessing(false)
  }

  return { sendCommand, isProcessing, logs }
}
