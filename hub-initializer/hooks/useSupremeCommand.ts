import { useState } from 'react';
import { sendToSupreme } from '../services/supremeOrchestrator';

export function useSupremeCommand() {
  const [isProcessing, setProcessing] = useState(false);

  const sendCommand = async (command: string) => {
    if (!command || isProcessing) return;
    setProcessing(true);
    try {
      await sendToSupreme(command);
    } catch (error) {
      console.error("Failed to execute supreme command:", error);
    } finally {
      setProcessing(false);
    }
  };

  return { 
    sendCommand, 
    isProcessing
  };
}