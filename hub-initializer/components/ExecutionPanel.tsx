import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Play, StopCircle, CheckCircle, Loader2, Info, AlertTriangle, PlayCircle } from 'lucide-react';
import { InitializerLog } from '../../types';
import { cn } from '../../lib/utils';

interface ExecutionPanelProps {
  isProcessing: boolean;
  onUpload: (files: FileList) => void;
  logs: InitializerLog[];
}

const statusIcons = {
  success: <CheckCircle className="text-green-500" size={16} />,
  error: <AlertTriangle className="text-red-500" size={16} />,
  info: <Info className="text-blue-500" size={16} />,
  running: <Loader2 className="text-primary animate-spin" size={16} />,
};

const ExecutionPanel: React.FC<ExecutionPanelProps> = ({ isProcessing, onUpload, logs }) => {
  return (
    <Card className="min-h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg">Painel de Sincronização</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 flex-grow flex flex-col">
        {/* File Upload */}
        <div>
             <h4 className="text-md font-semibold mb-2">📤 Upload e Sincronização Automática</h4>
             <input
                type="file"
                accept=".md"
                multiple
                onChange={(e) => e.target.files && onUpload(e.target.files)}
                disabled={isProcessing}
                className="w-full text-sm text-textSecondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
            />
            <p className="text-xs text-textSecondary mt-2">
                Selecione os arquivos `.md` dos agentes e módulos. O sistema irá sincronizar automaticamente com o Crew e o Supabase.
            </p>
            {isProcessing && <div className="mt-3 text-sm text-primary flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin"/> Processando arquivos...</div>}
        </div>
        
        {/* Log Viewer */}
        <div className="border-t pt-4 flex-grow flex flex-col min-h-0">
            <h4 className="text-md font-semibold mb-3">Logs da Execução</h4>
            <div className="flex-grow bg-secondary dark:bg-dark-secondary rounded-lg p-3 overflow-y-auto space-y-3">
                 {logs.length > 0 ? (
                    logs.map(log => (
                        <div key={log.id} className="flex items-start gap-3 text-sm font-mono animate-fade-in-up" style={{ animationDuration: '0.3s' }}>
                            <div className="mt-0.5">{statusIcons[log.status]}</div>
                            <div className="flex-1">
                                <p className={cn("font-medium", log.status === 'error' && 'text-red-600 dark:text-red-400')}>
                                    <span className="text-primary/80">{`[${log.agent_name}]`}</span> {log.action}
                                </p>
                                <p className="text-xs text-textSecondary/70">{new Date(log.timestamp).toLocaleTimeString()}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center text-textSecondary h-full flex items-center justify-center">
                        <p>Aguardando upload de arquivos para iniciar a sincronização...</p>
                    </div>
                )}
            </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExecutionPanel;