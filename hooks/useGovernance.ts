import { useEffect, useState, useCallback } from "react";
import { dataService } from "../services/dataService";
import { SystemSettingsHistory, GovernanceSuggestion } from "../types";
import { toast } from "./use-toast";
import { supabase } from "../lib/supabaseClient";

export function useGovernance() {
  const [suggestions, setSuggestions] = useState<GovernanceSuggestion[]>([]);
  const [history, setHistory] = useState<SystemSettingsHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const listener = dataService.listenToCollection<GovernanceSuggestion>('governance_suggestions', undefined, (data) => {
        setSuggestions(data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
        setIsLoading(false);
    });
    return () => listener.unsubscribe();
  }, []);

  const runAIAnalysis = useCallback(async () => {
    setIsAdjusting(true);
    try {
      const kpis = await dataService.getCollection('analytics_kpis');
      const settings = await dataService.getCollection('system_settings');
      
      const { data: result, error } = await supabase.functions.invoke('ai-governance', {
        body: { kpis, settings }
      });

      if (error) throw error;
      
      if (result.length > 0) {
        toast({ title: 'Análise da IA Concluída', description: `${result.length} nova(s) sugestão(ões) gerada(s).`});
      } else {
        toast({ title: 'Análise da IA Concluída', description: 'Nenhum ajuste recomendado no momento.'});
      }
      // Realtime listener will update the suggestions list
    } catch (error) {
        toast({ title: 'Erro na Análise de IA', description: (error as Error).message, variant: 'destructive'});
    } finally {
        setIsAdjusting(false);
    }
  }, []);
  
  const updateSuggestionStatus = useCallback(async (suggestion: GovernanceSuggestion, status: 'accepted' | 'rejected') => {
    setIsSubmitting(true);
    try {
      await dataService.updateDocument<GovernanceSuggestion>('governance_suggestions', suggestion.id, { status });
      
      if (status === 'accepted') {
          await dataService.updateSystemSetting(suggestion.setting_key, suggestion.suggested_value);
          toast({ title: 'Ajuste Aplicado!', description: `O parâmetro ${suggestion.setting_key} foi atualizado.`});
      } else {
          toast({ title: 'Sugestão Rejeitada', description: 'A sugestão foi arquivada.' });
      }
      // Realtime listener will handle UI updates
    } catch (error) {
       toast({ title: 'Erro', description: (error as Error).message, variant: 'destructive'});
    } finally {
      setIsSubmitting(false);
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
    setIsSubmitting(true);
    try {
      await dataService.revertSettingValue(historyId);
      toast({ title: 'Sucesso!', description: 'O parâmetro foi revertido para a versão selecionada.' });
    } catch(e) {
      toast({ title: 'Erro', description: 'Não foi possível reverter a alteração.', variant: 'destructive' });
    } finally {
        setIsSubmitting(false);
    }
  }, []);

  return { 
      suggestions, 
      history, 
      runAIAnalysis, 
      isLoading, 
      isAdjusting, 
      isSubmitting,
      updateSuggestionStatus,
      fetchHistory, 
      revertToVersion 
    };
}