import React, { createContext, useContext, useState, ReactNode } from 'react';

interface InitializerContextType {
  isAwaitingResponse: boolean;
  command: string | null;
  sendCommand: (command: string) => void;
  resolveCommand: () => void;
}

const InitializerContext = createContext<InitializerContextType | undefined>(undefined);

export const useInitializerContext = () => {
  const context = useContext(InitializerContext);
  if (!context) {
    throw new Error("useInitializerContext must be used within an InitializerProvider");
  }
  return context;
};

interface InitializerProviderProps {
  children: ReactNode;
}

export const InitializerProvider: React.FC<InitializerProviderProps> = ({ children }) => {
  const [isAwaitingResponse, setIsAwaitingResponse] = useState(false);
  const [command, setCommand] = useState<string | null>(null);

  const sendCommand = (cmd: string) => {
    setCommand(cmd);
    setIsAwaitingResponse(true);
  };

  const resolveCommand = () => {
    setCommand(null);
    setIsAwaitingResponse(false);
  };

  const value = { isAwaitingResponse, command, sendCommand, resolveCommand };

  return (
    <InitializerContext.Provider value={value}>
      {children}
    </InitializerContext.Provider>
  );
};
