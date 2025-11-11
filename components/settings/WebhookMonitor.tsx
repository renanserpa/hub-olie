import React from 'react';
import { useIntegrations } from '../../hooks/useIntegrations';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Rss, Loader2, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';

const WebhookMonitor: React.FC = () => {
    const { webhookLogs, loading, retryWebhook } = useIntegrations();
    const [retryingId, setRetryingId] = React.useState<string | null>(null);

    const formatDate = (dateStr: string) => new Date(dateStr).toLocaleString('pt-BR');

    const handleRetry = async (logId: string) => {
        setRetryingId(logId);
        await retryWebhook(logId);
        setRetryingId(null);
    };

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
                        {webhookLogs.map(log => {
                            const isError = log.status === 'error';
                            const isRetrying = retryingId === log.id;
                            return (
                                <li key={log.id} className="p-3 bg-secondary rounded-lg text-xs font-mono animate-fade-in-up">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold text-textPrimary">ID Integração: <span className="text-primary">{log.integration_id}</span></p>
                                            <p className="text-textSecondary/80">{formatDate(log.created_at)}</p>
                                        </div>
                                        <div className={cn("flex items-center gap-1.5 text-xs font-sans font-semibold", isError ? "text-red-600" : "text-green-600")}>
                                            {isError ? <XCircle size={14}/> : <CheckCircle size={14}/>}
                                            {isError ? 'Falha' : 'Sucesso'}
                                        </div>
                                    </div>
                                    <details className="mt-2">
                                        <summary className="cursor-pointer text-xs">Ver Payload</summary>
                                        <pre className="mt-1 p-2 bg-background rounded-md text-xs whitespace-pre-wrap break-all max-h-40 overflow-auto">
                                            {JSON.stringify(log.payload, null, 2)}
                                        </pre>
                                    </details>
                                    {isError && (
                                        <div className="mt-2 text-right">
                                            <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => handleRetry(log.id)} disabled={isRetrying}>
                                                {isRetrying ? <Loader2 className="w-3 h-3 animate-spin mr-1"/> : <RefreshCw className="w-3 h-3 mr-1"/>}
                                                Repetir
                                            </Button>
                                        </div>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                )}
            </CardContent>
        </Card>
    );
};

export default WebhookMonitor;