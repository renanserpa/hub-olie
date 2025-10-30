import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Play, StopCircle, CheckCircle, Loader2 } from 'lucide-react';

interface ExecutionPanelProps {
  status: 'idle' | 'running' | 'done' | 'stopped';
  onRun: () => void;
  onStop: () => void;
  isProcessing: boolean;
  onUpload: (files: FileList) => void;
}

const ExecutionPanel: React.FC<ExecutionPanelProps> = ({ status, onRun, onStop, isProcessing, onUpload }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Painel de Controle</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Pipeline Execution */}
        <div>
            <h4 className="text-md font-semibold mb-2">Pipeline de Sincronização</h4>
            <p className="text-sm text-textSecondary mb-3">
                Inicie o pipeline para validar a integridade dos módulos.
            </p>
            <div className="flex gap-3">
              <Button onClick={onRun} disabled={status === 'running' || isProcessing} className="flex-1">
                {status === 'running' && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {status === 'done' || status === 'stopped' ? 'Executar Novamente' : 'Executar Pipeline'}
              </Button>
              <Button onClick={onStop} disabled={status !== 'running' || isProcessing} variant="outline" className="flex-1">
                <StopCircle className="w-4 h-4 mr-2" />
                Parar
              </Button>
            </div>
        </div>

        {/* File Upload */}
        <div className="border-t pt-4">
             <h4 className="text-md font-semibold mb-2">📤 Enviar Arquivos .md</h4>
             <input
                type="file"
                accept=".md"
                multiple
                onChange={(e) => e.target.files && onUpload(e.target.files)}
                disabled={isProcessing || status === 'running'}
                className="w-full text-sm text-textSecondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
            />
            <p className="text-xs text-textSecondary mt-2">
                Selecione os arquivos `.md` dos agentes e módulos para sincronização automática.
            </p>
            {isProcessing && <div className="mt-3 text-sm text-primary flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin"/> Processando arquivos...</div>}
        </div>
      </CardContent>
    </Card>
  );
};

export default ExecutionPanel;