import React from 'react';
import { useIntegrations } from '../hooks/useIntegrations';
import { IntegrationCard } from './settings/IntegrationCard';
import { Button } from './ui/Button';
import { RefreshCw, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import WebhookMonitor from './settings/WebhookMonitor';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';

export function IntegrationsTabContent() {
  const { integrations, logs, loading, refresh } = useIntegrations();

  if (loading && integrations.length === 0) {
      return (
          <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
      );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-textPrimary dark:text-dark-textPrimary">Gerenciador de Integrações</h2>
          <Button variant="outline" onClick={refresh} disabled={loading}>
              <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
              Atualizar Status
          </Button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {integrations.map((integration) => (
            <IntegrationCard
                  key={integration.id}
                  integration={integration}
                  allLogs={logs}
            />
          ))}
        </div>
      </div>
      <div className="sticky top-24">
        <WebhookMonitor />
      </div>
    </div>
  );
}

export default IntegrationsTabContent;