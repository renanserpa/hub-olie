import React from 'react';
import { useAgentSync } from '../../hub-initializer/hooks/useAgentSync';
import AgentStatusCard from '../../hub-initializer/components/AgentStatusCard';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Loader2 } from 'lucide-react';

const AiHealthMonitorPanel: React.FC = () => {
  const { agents, isLoading } = useAgentSync();

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Health Monitor - Status dos Agentes</CardTitle>
        <p className="text-sm text-textSecondary">Monitoramento em tempo real da AtlasAI Crew.</p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {agents.map(agent => (
              <AgentStatusCard key={agent.id} agent={agent} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AiHealthMonitorPanel;