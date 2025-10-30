import { useEffect, useState, useCallback } from "react";
import { dynamicConfigTuner } from "../services/aiTunerService";
import { dataService } from "../services/dataService";
import { SystemSettingsLog } from "../types";
import { toast } from "./use-toast";

export function useGovernance() {
  const [logs, setLogs] = useState<SystemSettingsLog[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdjusting, setIsAdjusting] = useState(false);

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
      const result = await dynamicConfigTuner();
      setSuggestions(result);
      toast({ title: 'Análise da IA Concluída', description: `${result.length} ajuste(s) foram aplicados.`});
      // Logs will be updated automatically by the realtime listener
    } catch (error) {
        toast({ title: 'Erro na Análise de IA', description: (error as Error).message, variant: 'destructive'});
    } finally {
        setIsAdjusting(false);
    }
  }, []);

  return { logs, suggestions, runAIAdjustment, isLoading, isAdjusting };
}
