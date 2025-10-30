import React from 'react';
import { useInitializer } from '../hooks/useInitializer';
import SupremeCommandBox from './SupremeCommandBox';

export default function ExecutionPanel() {
  const { handleUpload, isProcessing } = useInitializer()

  return (
    <div className="bg-card p-6 rounded-2xl shadow-lg dark:bg-dark-card">
      <h2 className="text-xl font-semibold mb-4">📤 Upload e Sincronização</h2>
      <input
        type="file"
        accept=".md"
        multiple
        onChange={(e) => e.target.files && handleUpload(e.target.files)}
        disabled={isProcessing}
        className="w-full text-sm text-textSecondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
      />
      <p className="text-sm text-muted-foreground mt-2 dark:text-dark-textSecondary">
        Envie arquivos `.md` dos agentes e módulos (v2 / v3_diff). O sistema sincroniza automaticamente com Supabase e Crew.
      </p>
      {isProcessing && <p className="text-green-500 mt-3">⏳ Processando...</p>}
      <SupremeCommandBox />
    </div>
  )
}
