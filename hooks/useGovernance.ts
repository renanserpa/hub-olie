import { useEffect, useState, useCallback } from "react";
import { geminiService } from "../services/geminiService";
import { dataService } from "../services/dataService";
import { SystemSettingsLog, SystemSetting, SystemSettingsHistory } from "../types";
import { toast } from "./use-toast";
import { supabase } from "../lib/supabaseClient";

export interface AISuggestion {
  key: string;
  newValue: any;
  confidence: number;
  explanation: string;
}

export function useGovernance() {
  const [logs, setLogs] = useState<SystemSettingsLog[]>([]);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [history, setHistory] = useState<SystemSettingsHistory[]>([]);
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
      
      const { data: result, error } = await supabase.functions.invoke('ai-governance', {
        body: { kpis, settings }
      });

      if (error) throw error;
      
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

  const fetchHistory = useCallback(async (settingKey: string) => {
    try {
        const historyData = await dataService.getSettingsHistory(settingKey);
        setHistory(historyData);
    } catch(e) {
        toast({ title: 'Erro', description: 'Não foi possível carregar o histórico.', variant: 'destructive' });
    }
  }, []);

  const revertToVersion = useCallback(async (historyId: string) => {
    try {
      await dataService.revertSettingValue(historyId);
      toast({ title: 'Sucesso!', description: 'O parâmetro foi revertido para a versão selecionada.' });
    } catch(e) {
      toast({ title: 'Erro', description: 'Não foi possível reverter a alteração.', variant: 'destructive' });
    }
  }, []);


  return { logs, suggestions, history, runAIAdjustment, isLoading, isAdjusting, applySuggestion, applyingSuggestionKey, fetchHistory, revertToVersion };
}