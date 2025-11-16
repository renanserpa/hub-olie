import React, { useState, useEffect } from 'react';
import { dataService } from '../../services/dataService';
import { SystemSettingsLog } from '../../types';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Loader2, Sparkles, History, List, Check } from 'lucide-react';
import { Badge } from '../ui/Badge';

export function GovernancePanel() {
  const [logs, setLogs] = useState<SystemSettingsLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    // FIX: Added the 4th argument `setLogs` to match the expected signature of `listenToCollection`.
    const listener = dataService.listenToCollection<SystemSettingsLog>('system_settings_logs', undefined, (data) => {
        setLogs(data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
        setIsLoading(false);
    }, setLogs);
    return () => listener.unsubscribe();
  }, []);


  const formatDate = (dateStr: string) => {
      return new Date(dateStr).toLocaleString('pt-BR', {
          day: '2-digit', month: '2-digit', year: 'numeric',
          hour: '2-digit', minute: '2-digit', second: '2-digit'
      });
  };

  return (
    <Card className="h-[calc(100vh-12rem)] flex flex-col">
      <CardHeader className="flex-row items-center justify-between flex-shrink-0">
        <CardTitle className="text-lg flex items-center gap-2">
            <History className="text-primary"/>
            Histórico de Governança
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-textPrimary dark:text-dark-textPrimary mb-3 flex items-center gap-2"><History size={16}/> Histórico de Alterações de Parâmetros</h3>
          {isLoading ? (
            <div className="text-sm text-textSecondary dark:text-dark-textSecondary flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin"/>Carregando histórico...</div>
          ) : logs.length > 0 ? (
            <ul className="space-y-3">
              {logs.map((log) => (
                <li key={log.id} className="border-l-2 pl-3 text-xs animate-fade-in-up">
                  <p>
                    <strong className="font-semibold text-textPrimary dark:text-dark-textPrimary">{log.key}</strong>
                    <span className="text-textSecondary dark:text-dark-textSecondary"> alterado por </span> 
                    <Badge variant={log.source_module === 'AI' ? 'default' : 'secondary'} className="text-xs">{log.source_module}</Badge>
                  </p>
                   <p className="text-textSecondary dark:text-dark-textSecondary mt-1">{log.explanation}</p>
                   <p className="text-textSecondary/70 dark:text-dark-textSecondary/70 mt-1">{formatDate(log.created_at)}</p>
                </li>
              ))}
            </ul>
          ) : (
             <p className="text-sm text-textSecondary dark:text-dark-textSecondary p-3 bg-secondary dark:bg-dark-secondary rounded-lg">Nenhum registro de alteração encontrado.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}