import { useEffect, useState, useCallback } from "react";
import { dataService } from '../services/dataService';
import { Integration, IntegrationLog } from '../types';
import { toast } from './use-toast';

export function useIntegrations() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [logs, setLogs] = useState<IntegrationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null); // State for saving API key

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
      toast({ title: 'Atenção', description: 'A chave de API não pode estar vazia.', variant: 'destructive' });
      return;
    }
    setSavingId(id);
    try {
      // FIX: Add the generic type <Integration> to the updateDocument call to ensure TypeScript knows the correct shape of the update payload, resolving the error about the 'api_key' property not existing.
      await dataService.updateDocument<Integration>('config_integrations', id, { api_key: apiKey });
      toast({ title: 'Sucesso!', description: 'Chave de API salva com segurança.' });
    } catch (e) {
      toast({ title: 'Erro', description: 'Não foi possível salvar a chave de API.', variant: 'destructive' });
    } finally {
      setSavingId(null);
    }
  };

  return { integrations, logs, loading, testingId, savingId, refresh, handleTestConnection, updateApiKey };
}
