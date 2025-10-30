import { useState, useEffect } from 'react';
import { InitializerAgent } from '../../types';

type HealthStatus = 'Operational' | 'Degraded' | 'Critical';

export function useSystemHealth(agents: InitializerAgent[]) {
  const [healthScore, setHealthScore] = useState(100);
  const [healthStatus, setHealthStatus] = useState<HealthStatus>('Operational');

  useEffect(() => {
    if (agents.length === 0) {
      setHealthScore(100);
      setHealthStatus('Operational');
      return;
    }

    const onlineAgents = agents.filter(a => a.status !== 'offline');
    const errorAgents = agents.filter(a => a.status === 'error');
    
    const onlinePercentage = (onlineAgents.length / agents.length) * 100;
    const errorPercentage = (errorAgents.length / agents.length) * 100;

    // Simple scoring logic: 100 base, -10 for each agent in error, -5 if offline.
    const score = 100 - (errorPercentage * 10) - ((100 - onlinePercentage) * 5);
    const finalScore = Math.max(0, Math.round(score));

    setHealthScore(finalScore);

    if (finalScore < 50 || errorPercentage > 20) {
      setHealthStatus('Critical');
    } else if (finalScore < 90) {
      setHealthStatus('Degraded');
    } else {
      setHealthStatus('Operational');
    }

  }, [agents]);

  return { healthScore, healthStatus };
}
