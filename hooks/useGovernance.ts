import { useEffect, useState, useCallback } from "react";
import { geminiService } from "../services/geminiService";
import { dataService } from "../services/dataService";
import { SystemSettingsLog, SystemSetting } from "../types";
import { toast } from "./use-toast";

export interface AISuggestion {
  key: string;
  newValue: any;
  confidence: number;
  explanation: string;
}

export function useGovernance() {
  const [logs, setLogs] = useState<SystemSettingsLog[]>([]);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [applyingSuggestionKey, setApplyingSuggestionKey] = useState<string | null>(null);


  useEffect(() => {
    setIsLoading(true);
    const listener = dataService.listenToCollection<SystemSettingsLog>('system_settings_logs', undefined, (data) => {
        setLogs(data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
        setIsLoading(false);
    });

    return () => listener.unsubscribe();
  }, []);


  const runAIAdjustment = useCallback(async () => {
    setIsAdjusting(true);
    setSuggestions([]);
    try {
      const kpis = await dataService.getCollection('analytics_kpis');
      const settings = await dataService.getCollection<SystemSetting>('system_settings');
      const result = await geminiService.generateSystemOptimizations(kpis, settings);
      setSuggestions(result);
      if (result.length > 0) {
        toast({ title: 'Análise da IA Concluída', description: `${result.length} sugestão(ões) gerada(s).`});
      } else {
        toast({ title: 'Análise da IA Concluída', description: 'Nenhum ajuste recomendado no momento.'});
      }
    } catch (error) {
        toast({ title: 'Erro na Análise de IA', description: (error as Error).message, variant: 'destructive'});
    } finally {
        setIsAdjusting(false);
    }
  }, []);
  
  const applySuggestion = useCallback(async (suggestion: AISuggestion) => {
    setApplyingSuggestionKey(suggestion.key);
    try {
      await dataService.updateSystemSetting(
        suggestion.key,
        suggestion.newValue,
        'AI',
        suggestion.confidence,
        suggestion.explanation
      );
      toast({ title: 'Ajuste Aplicado!', description: `O parâmetro ${suggestion.key} foi atualizado.`});
      // Remove applied suggestion from the list
      setSuggestions(prev => prev.filter(s => s.key !== suggestion.key));
    } catch (error) {
       toast({ title: 'Erro ao Aplicar Ajuste', description: (error as Error).message, variant: 'destructive'});
    } finally {
      setApplyingSuggestionKey(null);
    }
  }, []);

  return { logs, suggestions, runAIAdjustment, isLoading, isAdjusting, applySuggestion, applyingSuggestionKey };
}