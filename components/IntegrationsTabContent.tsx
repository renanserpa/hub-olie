import React from 'react';
import { useIntegrations } from '../hooks/useIntegrations';
import { IntegrationCard } from './settings/IntegrationCard';
import { Button } from './ui/Button';
import { RefreshCw, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

export function IntegrationsTabContent() {
  const { integrations, logs, loading, testingId, refresh, handleTestConnection } = useIntegrations();

  if (loading && integrations.length === 0) {
      return (
          <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
      );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-textPrimary dark:text-dark-textPrimary">Gerenciador de Integrações</h2>
        <Button variant="outline" onClick={refresh} disabled={loading}>
            <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
            Atualizar Status
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {integrations.map((integration) => (
          <IntegrationCard
                key={integration.id}
                integration={integration}
                allLogs={logs}
                onTestConnection={handleTestConnection}
                isTesting={testingId === integration.id}
          />
        ))}
      </div>
    </div>
  );
}

export default IntegrationsTabContent;