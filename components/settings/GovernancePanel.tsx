import React from 'react';
import { useGovernance, AISuggestion } from '../../hooks/useGovernance';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Loader2, Sparkles, History, List, Check } from 'lucide-react';
import { Badge } from '../ui/Badge';

export function GovernancePanel() {
  const { logs, suggestions, runAIAdjustment, isLoading, isAdjusting, applySuggestion, applyingSuggestionKey } = useGovernance();

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
            <Sparkles className="text-primary"/>
            Governança Inteligente
        </CardTitle>
        <Button onClick={runAIAdjustment} disabled={isAdjusting} size="sm">
            {isAdjusting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Analisar Sistema
        </Button>
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto space-y-6">
        <div>
            <h3 className="text-sm font-semibold text-textPrimary dark:text-dark-textPrimary mb-2 flex items-center gap-2"><List size={16}/>Sugestões da IA</h3>
            {isAdjusting ? (
                 <div className="text-sm text-textSecondary dark:text-dark-textSecondary flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin"/>Analisando métricas...</div>
            ) : suggestions.length > 0 ? (
                <div className="space-y-2">
                    {suggestions.map((s, i) => {
                        const isApplying = applyingSuggestionKey === s.key;
                        return (
                            <div key={i} className="border border-primary/50 bg-primary/10 p-3 rounded-lg text-sm animate-fade-in-up">
                                <p className="font-semibold">{s.key}</p>
                                <p className="text-xs text-primary/80 mt-1">{s.explanation}</p>
                                <div className="flex justify-between items-center mt-2">
                                    <Badge variant="secondary" className="text-xs">Confiança: {(s.confidence * 100).toFixed(0)}%</Badge>
                                    <Button size="sm" variant="secondary" onClick={() => applySuggestion(s)} disabled={isApplying}>
                                        {isApplying ? <Loader2 className="w-4 h-4 animate-spin"/> : <Check className="w-4 h-4 mr-1"/>}
                                        Aplicar
                                    </Button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <p className="text-sm text-textSecondary dark:text-dark-textSecondary p-3 bg-secondary dark:bg-dark-secondary rounded-lg">Nenhuma sugestão de ajuste no momento.</p>
            )}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-textPrimary dark:text-dark-textPrimary mb-3 flex items-center gap-2"><History size={16}/> Histórico de Alterações</h3>
          {isLoading ? (
            <div className="text-sm text-textSecondary dark:text-dark-textSecondary flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin"/>Carregando histórico...</div>
          ) : logs.length > 0 ? (
            <ul className="space-y-3">
              {logs.map((log) => (
                <li key={log.id} className="border-l-2 pl-3 text-xs">
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