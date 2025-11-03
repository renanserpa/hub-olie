import { useEffect, useState, useCallback } from "react";
import { dataService } from '../services/dataService';
import { Integration, IntegrationLog } from '../types';
import { toast } from './use-toast';

export function useIntegrations() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [logs, setLogs] = useState<IntegrationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
        const data = await dataService.getCollection<Integration>('config_integrations');
        setIntegrations(data);
    } finally {
        setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    const integrationsListener = dataService.listenToCollection<Integration>('config_integrations', undefined, (data) => {
        setIntegrations(data);
        setLoading(false);
    });

    const logsListener = dataService.listenToCollection<IntegrationLog>('integration_logs', undefined, (data) => {
        setLogs(data);
    });

    return () => {
        integrationsListener.unsubscribe();
        logsListener.unsubscribe();
    };
  }, []);

  const handleTestConnection = async (id: string) => {
    setTestingId(id);
    try {
        await dataService.testIntegrationConnection(id);
        toast({ title: 'Teste Concluído', description: 'O status da integração foi atualizado.' });
    } catch(e) {
        toast({ title: 'Erro no Teste', description: (e as Error).message, variant: 'destructive' });
    } finally {
        setTestingId(null);
    }
  };

  const updateApiKey = async (id: string, apiKey: string) => {
    if (!apiKey) {
        toast({ title: 'Atenção', description: 'A chave de API não pode ser vazia.', variant: 'destructive' });
        return;
    }
    setSavingId(id);
    try {
      // NOTE: We are not saving the actual key for security reasons, just updating the record.
      // In a real app, this would be handled by a secure backend service.
      await dataService.updateDocument<Integration>('config_integrations', id, { api_key: '********' });
      toast({ title: 'Chave Salva', description: 'A chave de API foi atualizada.' });
    } catch (e) {
      toast({ title: 'Erro ao Salvar Chave', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setSavingId(null);
    }
  };

  return { integrations, logs, loading, refresh, handleTestConnection, testingId, updateApiKey, savingId };
}