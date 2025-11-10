import React from 'react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Database, Loader2, AlertTriangle } from 'lucide-react';
import { useInitializer } from '../hooks/useInitializer';

export default function DataSeedingPanel() {
    const { handleSeedDatabase, isSeeding, isAdminGeral } = useInitializer();

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Database /> Popular Banco de Dados (Seed)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="p-4 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg text-amber-800 dark:text-amber-200 text-sm flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <div>
                        <h4 className="font-semibold">Atenção: Ação Potencialmente Destrutiva</h4>
                        <p>Esta ação irá inserir um conjunto de dados de desenvolvimento em seu banco de dados Supabase. **Não execute em um ambiente de produção com dados reais, pois pode causar duplicatas.**</p>
                    </div>
                </div>
                <p>Se suas tabelas estão vazias após a criação do schema, clique no botão abaixo para preenchê-las com os dados iniciais do ambiente de desenvolvimento (sandbox).</p>
                <Button onClick={handleSeedDatabase} disabled={isSeeding || !isAdminGeral} title={!isAdminGeral ? "Apenas AdminGeral pode executar esta ação" : ""}>
                    {isSeeding && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {isSeeding ? 'Populando Banco...' : 'Popular Banco com Dados Iniciais'}
                </Button>
            </CardContent>
        </Card>
    );
}
