import { useState, useEffect, useCallback } from 'react';
import { InitializerAgent } from '../../types';
import { dataService } from '../../services/dataService';
import { toast } from '../../hooks/use-toast';

export function useAgentSync() {
  const [agents, setAgents] = useState<InitializerAgent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadAgents = useCallback(async () => {
    try {
      const data = await dataService.getCollection<InitializerAgent>('initializer_agents');
      setAgents(data);
    } catch (e) {
      toast({ title: 'Erro', description: 'Não foi possível carregar o status dos agentes.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAgents();

    const interval = setInterval(() => {
      // Simulate heartbeats and random status changes
      setAgents(prevAgents => prevAgents.map(agent => {
        const isWorking = Math.random() > 0.7;
        const hasError = Math.random() > 0.95;
        return {
          ...agent,
          last_heartbeat: new Date().toISOString(),
          status: hasError ? 'error' : isWorking ? 'working' : 'idle',
        };
      }));
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [loadAgents]);

  return { agents, isLoading, refresh: loadAgents };
}
