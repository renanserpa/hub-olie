import { useState } from 'react'
import { sendToSupreme } from '../services/supremeOrchestrator'
import { reportGenerator } from '../services/reportGenerator'

export function useSupremeCommand() {
  const [isProcessing, setProcessing] = useState(false)

  const sendCommand = async (text: string) => {
    setProcessing(true)
    const result = await sendToSupreme(text)
    // The supremeOrchestrator now handles logging, but we can log the final result here.
    console.log(result.status);
    setProcessing(false)
  }

  return { sendCommand, isProcessing }
}
