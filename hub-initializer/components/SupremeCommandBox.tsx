import React, { useState } from 'react'
import { useSupremeCommand } from '../hooks/useSupremeCommand'
import { Loader2 } from 'lucide-react';

export default function SupremeCommandBox() {
  const [command, setCommand] = useState('')
  const { sendCommand, isProcessing, logs } = useSupremeCommand()

  const handleSend = () => {
      sendCommand(command);
      setCommand('');
  }

  return (
    <div className="bg-card p-4 mt-4 rounded-2xl shadow dark:bg-dark-card border-t dark:border-dark-border">
      <h3 className="text-lg font-semibold mb-3">🧠 Enviar Comando ao ArquitetoSupremo</h3>
      <textarea
        value={command}
        onChange={(e) => setCommand(e.target.value)}
        placeholder="Descreva la alteración técnica o auditoría deseada..."
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
      <div className="mt-3 bg-secondary dark:bg-dark-secondary p-3 rounded-lg text-sm h-48 overflow-y-auto font-mono">
        {logs.map((l, i) => (
          <div key={i}>{l}</div>
        ))}
      </div>
    </div>
  )
}
