import React from 'react';
import { useAgentSync } from '../hooks/useAgentSync';
import { useSystemHealth } from '../hooks/useSystemHealth';
import SystemHealthCard from '../components/SystemHealthCard';
import ExecutionPanel from '../components/ExecutionPanel';
import AgentStatusCard from '../components/AgentStatusCard';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Cpu } from 'lucide-react';
import SystemMonitor from '../components/SystemMonitor';
import DataSeedingPanel from '../components/DataSeedingPanel';
import ConnectionTestPanel from '../components/ConnectionTestPanel';

const InitializerPage: React.FC = () => {
  const { agents } = useAgentSync();
  const { healthScore, healthStatus } = useSystemHealth(agents);

  return (
    <div>
      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column (Main Panel) */}
        <div className="lg:col-span-2 space-y-6">
          <ExecutionPanel />
          <DataSeedingPanel />
          <ConnectionTestPanel />
          <SystemMonitor />
        </div>

        {/* Right Column (Status) */}
        <div className="lg:col-span-1 space-y-6">
          <SystemHealthCard score={healthScore} status={healthStatus} />
          <Card>
            <CardHeader><CardTitle className="text-lg">Status dos Agentes</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 max-h-[450px] overflow-y-auto">
              {agents.map(agent => (
                <AgentStatusCard key={agent.id} agent={agent} />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InitializerPage;