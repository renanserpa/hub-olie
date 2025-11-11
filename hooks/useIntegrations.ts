import { useEffect, useState, useCallback } from "react";
import { dataService } from '../services/dataService';
import { Integration, IntegrationLog, WebhookLog } from '../types';
import { toast } from './use-toast';
import { integrationsService } from "../services/integrationsService";

export function useIntegrations() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [logs, setLogs] = useState<IntegrationLog[]>([]);
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([]);
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

    const webhookLogsListener = dataService.listenToCollection<WebhookLog>('webhook_logs', undefined, (data) => {
      setWebhookLogs(data.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    });

    return () => {
        integrationsListener.unsubscribe();
        logsListener.unsubscribe();
        webhookLogsListener.unsubscribe();
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
      await integrationsService.updateApiKey(id, apiKey);
      toast({ title: 'Chave Enviada', description: 'A chave de API foi enviada para o serviço seguro.' });
      // In a real app, we might want to refresh the integration status after this
      // For now, we rely on the realtime listener if the backend updates the record.
    } catch (e) {
      toast({ title: 'Erro ao Salvar Chave', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setSavingId(null);
    }
  };

  return { integrations, logs, webhookLogs, loading, refresh, handleTestConnection, testingId, updateApiKey, savingId };
}
