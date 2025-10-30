import React, { useState } from 'react';
import { Integration, IntegrationLog } from '../../types';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { IntegrationStatusBadge } from './IntegrationStatusBadge';
import { IntegrationLogsDialog } from './IntegrationLogsDialog';
import { Loader2, List } from 'lucide-react';
import { cn } from '../../lib/utils';

interface IntegrationCardProps {
    integration: Integration;
    allLogs: IntegrationLog[];
    onTestConnection: (id: string) => void;
    isTesting: boolean;
}

// FIX: Changed component definition to use React.FC to correctly handle React-specific props like 'key'.
export const IntegrationCard: React.FC<IntegrationCardProps> = ({ integration, allLogs, onTestConnection, isTesting }) => {
    const [isLogsOpen, setIsLogsOpen] = useState(false);
    
    const relevantLogs = allLogs
        .filter(log => log.integration_id === integration.id)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return (
        <>
            <Card className={cn("flex flex-col", !integration.is_active && "opacity-60")}>
                <CardContent className="p-4 flex-grow flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                        <h3 className="font-bold text-textPrimary">{integration.name}</h3>
                        <IntegrationStatusBadge status={integration.status} />
                    </div>
                    <p className="text-xs text-textSecondary font-mono truncate">{integration.endpoint_url}</p>
                    {integration.last_error && (
                        <p className="text-xs text-red-500 bg-red-500/10 p-2 rounded-md">⚠️ {integration.last_error}</p>
                    )}
                    <div className="flex-grow"></div>
                    <div className="flex gap-2 mt-2 pt-2 border-t border-border">
                        <Button variant="outline" size="sm" onClick={() => onTestConnection(integration.id)} disabled={isTesting}>
                            {isTesting ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : null}
                            Testar Conexão
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setIsLogsOpen(true)}>
                            <List className="w-4 h-4 mr-2"/>
                            Ver Logs
                        </Button>
                    </div>
                </CardContent>
            </Card>
            <IntegrationLogsDialog
                isOpen={isLogsOpen}
                onClose={() => setIsLogsOpen(false)}
                logs={relevantLogs}
                integrationName={integration.name}
            />
        </>
    );
}