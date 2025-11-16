import React from 'react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Copy, Database } from 'lucide-react';
import { toast } from '../../hooks/use-toast';
import { bootstrapSqlScript } from '../../components/BootstrapModal';

export default function DatabaseBootstrapPanel() {

    const handleCopy = () => {
        navigator.clipboard.writeText(bootstrapSqlScript);
        toast({ title: "Script Copiado!", description: "Cole o script no seu SQL Editor do Supabase." });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Database /> Schema do Banco de Dados</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-sm text-textSecondary">
                    Este é o script de bootstrap completo (v7.0) que define todo o schema do banco de dados. Use-o para configurar um novo ambiente ou para garantir que seu ambiente local esteja sincronizado.
                </p>
                <div className="relative bg-secondary dark:bg-dark-secondary p-4 rounded-lg max-h-48 overflow-y-auto">
                    <Button size="sm" onClick={handleCopy} className="absolute top-2 right-2 z-10">
                        <Copy className="w-4 h-4 mr-2" /> Copiar Script
                    </Button>
                    <pre className="text-xs whitespace-pre-wrap font-mono">{bootstrapSqlScript}</pre>
                </div>
                 <div className="p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg text-blue-800 dark:text-blue-200 text-sm">
                    <strong>Fluxo de Trabalho:</strong> 
                    <ol className="list-decimal list-inside pl-2 mt-1">
                        <li>Copie o script acima.</li>
                        <li>Cole e execute no SQL Editor do seu projeto Supabase.</li>
                        <li>Volte aqui e use o painel &quot;Diagnóstico de Conexão&quot; abaixo para validar as alterações.</li>
                    </ol>
                </div>
            </CardContent>
        </Card>
    );
}