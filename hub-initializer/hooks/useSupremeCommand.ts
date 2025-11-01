import { useInitializerContext } from '../../context/InitializerContext';

export function useSupremeCommand() {
  const { isAwaitingResponse, sendCommand } = useInitializerContext();

  return { 
    sendCommand, 
    isProcessing: isAwaitingResponse 
  };
}
