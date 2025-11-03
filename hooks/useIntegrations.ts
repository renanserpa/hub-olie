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
        toast({ title: 'Erro no Test