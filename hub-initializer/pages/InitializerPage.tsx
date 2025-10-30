import React from 'react';
import { useInitializer } from '../hooks/useInitializer';
import { useAgentSync } from '../hooks/useAgentSync';
import { useSystemHealth } from '../hooks/useSystemHealth';
import SystemHealthCard from '../components/SystemHealthCard';
import ExecutionPanel from '../components/ExecutionPanel';
import PipelineLog from '../components/PipelineLog';
import AgentStatusCard from '../components/AgentStatusCard';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Cpu } from 'lucide-react';

const InitializerPage: React.FC = () => {
  const { agents } = useAgentSync();
  const { healthScore, healthStatus } = useSystemHealth(agents);
  const { logs, status, runPipeline, stopPipeline, currentStep, isProcessing, handleUpload } = useInitializer();

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
          <div>
              <div className="flex items-center gap-3">
                  <Cpu className="text-primary" size={28} />
                  <h1 className="text-3xl font-bold text-textPrimary">Hub Initializer</h1>
              </div>
              <p className="text-textSecondary mt-1">Sincronização e boot cognitivo do ecossistema AtlasAI.</p>
          </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-6">
          <SystemHealthCard score={healthScore} status={healthStatus} />
          <ExecutionPanel 
            status={status} 
            onRun={runPipeline} 
            onStop={stopPipeline}
            isProcessing={isProcessing}
            onUpload={handleUpload}
          />
        </div>

        {/* Center & Right Column */}
        <div className="lg:col-span-2 space-y-6">
          <PipelineLog logs={logs} currentStep={currentStep} />
          <Card>
            <CardHeader><CardTitle>Status dos Agentes</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
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