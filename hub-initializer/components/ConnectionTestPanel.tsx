import React from 'react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Zap, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useInitializer } from '../hooks/useInitializer';
import { cn } from '../../lib/utils';
import { runtime } from '../../lib/runtime';

export default function ConnectionTestPanel() {
    const { handleTestConnection, isTesting, testResult } = useInitializer();

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Zap /> Diagnóstico de Conexão</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-sm text-textSecondary">
                    Execute um teste de ponta a ponta para verificar a comunicação com o Supabase, incluindo credenciais,
                    conectividade de rede e políticas de segurança (RLS).
                </p>
                <Button onClick={handleTestConnection} disabled={isTesting || runtime.mode === 'SANDBOX'} title={runtime.mode === 'SANDBOX' ? "O teste de conexão só pode ser executado no modo SUPABASE." : ""}>
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
            </CardContent>
        </Card>
    );
}