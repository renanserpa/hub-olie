import React from 'react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Zap, Loader2, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { useInitializer } from '../hooks/useInitializer';
import { cn } from '../../lib/utils';
import { toast } from '../../hooks/use-toast';

export default function ConnectionTestPanel() {
    const { handleTestConnection, isTesting, testResult } = useInitializer();

    const handleForceSync = () => {
        toast({ title: "Sincronizando...", description: "Recarregando a aplicação para buscar os novos dados do banco." });
        // Use um pequeno atraso para permitir que o toast apareça antes do recarregamento da página.
        setTimeout(() => {
            window.location.reload();
        }, 500);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><RefreshCw /> Validação e Sincronização</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <h4 className="font-semibold text-textPrimary">Passo 1: Forçar Sincronização</h4>
                    <p className="text-sm text-textSecondary mt-1 mb-3">
                        Após executar qualquer script no SQL Editor do Supabase, clique aqui para forçar a recarga completa da aplicação. Isso limpa o cache local e garante que todos os novos dados e tabelas sejam carregados.
                    </p>
                    <Button onClick={handleForceSync}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Sincronizar Aplicação (Recarregar)
                    </Button>
                </div>
                
                <div className="border-t border-border dark:border-dark-border pt-4">
                    <h4 className="font-semibold text-textPrimary">Passo 2: Testar Conexão</h4>
                    <p className="text-sm text-textSecondary mt-1 mb-3">
                        Depois de recarregar, execute um teste de ponta a ponta para verificar a comunicação, incluindo credenciais,
                        conectividade de rede e políticas de segurança (RLS).
                    </p>
                    <Button 
                        onClick={handleTestConnection} 
                        variant="outline" 
                        // FIX: Removed runtime dependency as SANDBOX mode is deprecated.
                        disabled={isTesting} 
                        title=""
                    >
                        {isTesting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Executar Teste de Conexão
                    </Button>
                    {testResult && (
                        <div className={cn(
                            "p-3 rounded-lg text-sm flex items-start gap-3 mt-4 animate-fade-in-up",
                            testResult.success ? "bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-200" : "bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-200"
                        )}>
                            {testResult.success ? <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" /> : <XCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />}
                            <div>
                                <h4 className="font-semibold">{testResult.success ? 'Conexão Bem-sucedida' : 'Falha na Conexão'}</h4>
                                <p className="text-xs">{testResult.message}</p>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}