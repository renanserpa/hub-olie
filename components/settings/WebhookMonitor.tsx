import React from 'react';
import { useIntegrations } from '../../hooks/useIntegrations';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Rss, Loader2 } from 'lucide-react';

const WebhookMonitor: React.FC = () => {
    const { webhookLogs, loading } = useIntegrations();

    const formatDate = (dateStr: string) => new Date(dateStr).toLocaleString('pt-BR');

    return (
        <Card className="h-[calc(100vh-12rem)] flex flex-col">
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <Rss className="text-primary"/>
                    Monitor de Webhooks (Real-time)
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow overflow-y-auto">
                {loading && webhookLogs.length === 0 ? (
                    <div className="flex justify-center items-center h-full">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                ) : webhookLogs.length === 0 ? (
                    <div className="text-center text-textSecondary py-16">
                        <p>Aguardando eventos de webhook...</p>
                    </div>
                ) : (
                    <ul className="space-y-3">
                        {webhookLogs.map(log => (
                            <li key={log.id} className="p-3 bg-secondary rounded-lg text-xs font-mono animate-fade-in-up">
                                <p className="font-semibold text-textPrimary">ID Integração: <span className="text-primary">{log.integration_id}</span></p>
                                <p className="text-textSecondary/80">{formatDate(log.created_at)}</p>
                                <details className="mt-2">
                                    <summary className="cursor-pointer text-xs">Ver Payload</summary>
                                    <pre className="mt-1 p-2 bg-background rounded-md text-xs whitespace-pre-wrap break-all max-h-40 overflow-auto">
                                        {JSON.stringify(log.payload, null, 2)}
                                    </pre>
                                </details>
                            </li>
                        ))}
                    </ul>
                )}
            </CardContent>
        </Card>
    );
};

export default WebhookMonitor;
