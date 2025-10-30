import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { InitializerLog } from '../../types';
import { CheckCircle, AlertTriangle, Info, Loader2, PlayCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface PipelineLogProps {
  logs: InitializerLog[];
  currentStep: string;
}

const statusIcons = {
  success: <CheckCircle className="text-green-500" size={16} />,
  error: <AlertTriangle className="text-red-500" size={16} />,
  info: <Info className="text-blue-500" size={16} />,
  running: <Loader2 className="text-primary animate-spin" size={16} />,
};

const PipelineLog: React.FC<PipelineLogProps> = ({ logs, currentStep }) => {
  return (
    <Card className="h-[420px] flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg">Logs da Execução</CardTitle>
        {currentStep && (
            <p className="text-sm text-primary font-medium flex items-center gap-2">
                <PlayCircle size={14} /> Em andamento: {currentStep}
            </p>
        )}
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto pr-2">
        <div className="space-y-3">
            {logs.length > 0 ? (
                logs.map(log => (
                    <div key={log.id} className="flex items-start gap-3 text-sm animate-fade-in-up" style={{ animationDuration: '0.3s' }}>
                        <div className="mt-0.5">{statusIcons[log.status]}</div>
                        <div className="flex-1">
                            <p className={cn("font-medium", log.status === 'error' && 'text-red-600')}>
                                [{log.agent_name}] {log.action}
                            </p>
                            <p className="text-xs text-textSecondary">{new Date(log.timestamp).toLocaleTimeString()}</p>
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-center text-textSecondary pt-16">
                    <p>Aguardando início do pipeline...</p>
                </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PipelineLog;
