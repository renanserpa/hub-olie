import React, { useState } from 'react'
import { useSupremeCommand } from '../hooks/useSupremeCommand'
import { Loader2 } from 'lucide-react';

export default function SupremeCommandBox() {
  const [command, setCommand] = useState('')
  const { sendCommand, isProcessing } = useSupremeCommand()

  const handleSend = () => {
      sendCommand(command);
      setCommand('');
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
    }
  };

  return (
    <div className="bg-secondary dark:bg-dark-secondary p-4 mt-4 rounded-xl border border-border/50 dark:border-dark-border/50">
      <h3 className="text-lg font-semibold mb-3">🧠 Enviar Comando ao ArquitetoSupremo</h3>
      <textarea
        value={command}
        onChange={(e) => setCommand(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Descreva a alteração técnica ou auditoria desejada..."
        className="w-full p-3 rounded-lg border border-border dark:border-dark-border text-sm mb-3 bg-background dark:bg-dark-background"
        rows={3}
      />
      <button
        disabled={!command || isProcessing}
        onClick={handleSend}
        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:bg-primary/50 disabled:cursor-not-allowed flex items-center"
      >
        {isProcessing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin"/> Enviando...</> : '🚀 Enviar Comando'}
      </button>
    </div>
  )
}
