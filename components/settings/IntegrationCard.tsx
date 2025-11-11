import React, { useState } from 'react';
import { Integration, IntegrationLog } from '../../types';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { IntegrationStatusBadge } from './IntegrationStatusBadge';
import { IntegrationLogsDialog } from './IntegrationLogsDialog';
import { Loader2, List, Key, Save, Copy } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useIntegrations } from '../../hooks/useIntegrations';
import { toast } from '../../hooks/use-toast';

interface IntegrationCardProps {
    integration: Integration;
    allLogs: IntegrationLog[];
}

export const IntegrationCard: React.FC<IntegrationCardProps> = ({ integration, allLogs }) => {
    const [isLogsOpen, setIsLogsOpen] = useState(false);
    const [apiKeyInput, setApiKeyInput] = useState('');
    
    const { handleTestConnection, testingId, updateApiKey, savingId } = useIntegrations();
    
    const isTesting = testingId === integration.id;
    const isSavingKey = savingId === integration.id;

    const handleSaveKey = async () => {
        await updateApiKey(integration.id, apiKeyInput);
        setApiKeyInput(''); // Clear input on save
    };

    const relevantLogs = allLogs
        .filter(log => log.integration_id === integration.id)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const supabaseUrl = "https://ijheukynkppcswgtrnwd.supabase.co";
    const webhookUrl = `${supabaseUrl}/functions/v1/webhook-handler?integration_id=${integration.id}`;

    const handleCopyWebhookUrl = () => {
        navigator.clipboard.writeText(webhookUrl);
        toast({ title: 'URL Copiada!', description: 'A URL do webhook foi copiada para a área de transferência.' });
    };

    return (
        <>
            <Card className={cn("flex flex-col", !integration.is_active && "opacity-60")}>
                <CardContent className="p-4 flex-grow flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                        <h3 className="font-bold text-textPrimary">{integration.name}</h3>
                        <IntegrationStatusBadge status={integration.status} />
                    </div>
                    
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-xs font-medium text-textSecondary">
                            <Key size={14} />
                            Chave de API
                        </label>
                        <div className="flex gap-2">
                            <input
                                id={`api-key-${integration.id}`}
                                type="password"
                                value={apiKeyInput}
                                onChange={(e) => setApiKeyInput(e.target.value)}
                                placeholder="Insira ou atualize a chave"
                                className="flex-grow w-full px-3 py-1.5 border border-border dark:border-dark-border rounded-md shadow-sm bg-background dark:bg-dark-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                                disabled={isSavingKey || isTesting}
                            />
                            <Button variant="outline" size="sm" onClick={handleSaveKey} disabled={!apiKeyInput || isSavingKey || isTesting} className="px-3">
                                {isSavingKey ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            </Button>
                        </div>
                    </div>
                     <div className="space-y-2">
                        <label className="text-xs font-medium text-textSecondary">Webhook URL</label>
                        <div className="flex gap-2">
                             <input
                                readOnly
                                value={webhookUrl}
                                className="flex-grow w-full px-3 py-1.5 border border-border rounded-md bg-secondary/50 text-xs font-mono"
                            />
                            <Button variant="outline" size="sm" onClick={handleCopyWebhookUrl} className="px-3">
                                <Copy className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                    
                    {integration.last_error && (
                        <p className="text-xs text-red-500 bg-red-500/10 p-2 rounded-md">⚠️ {integration.last_error}</p>
                    )}

                    <div className="flex-grow"></div>
                    <div className="flex gap-2 mt-2 pt-3 border-t border-border">
                        <Button variant="outline" size="sm" onClick={() => handleTestConnection(integration.id)} disabled={isTesting || isSavingKey}>
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
};