import React, { useEffect, useState, useMemo } from 'react';
import { dataService } from '../../services/dataService';
import { SystemSettingsHistory, SystemAudit } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Loader2, BarChart2, User, Sparkles, ShieldAlert, Lightbulb } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import StatCard from '../dashboard/StatCard';
import { useGovernance, AISuggestion } from '../../hooks/useGovernance';
import { Button } from '../ui/Button';
import { useAnomalies } from '../../hooks/useAnomalies';

const AnomalyFeed: React.FC = () => {
    const { anomalies, isLoading } = useAnomalies();

    if (isLoading) {
        return <Loader2 className="w-4 h-4 animate-spin" />;
    }

    if (anomalies.length === 0) {
        return <p className="text-xs text-textSecondary p-3 bg-secondary rounded-lg">Nenhuma anomalia detectada recentemente.</p>
    }
    
    const renderDetails = (details: any) => {
        if (!details) return 'Nenhum detalhe disponível.';
        if (details.user && details.attempted_scope) {
            return `Usuário ${details.user} tentou acessar ${details.attempted_scope} (${details.count || 1}x).`;
        }
        if (details.integration && details.error) {
            return `Integração ${details.integration}: ${details.error}.`;
        }
        return JSON.stringify(details);
    }

    return (
        <div className="space-y-2">
            {anomalies.map(anomaly => (
                <div key={anomaly.id} className="p-2 border border-red-500/30 bg-red-500/10 rounded-lg text-xs">
                    <p className="font-semibold text-red-700 flex items-center gap-1"><ShieldAlert size={14}/> {anomaly.key}</p>
                    <p className="text-red-600/80">{renderDetails(anomaly.details)}</p>
                </div>
            ))}
        </div>
    );
};


const CognitiveGovernanceDashboard: React.FC = () => {
    const { history, isLoading, suggestions, runAIAdjustment, isAdjusting, applySuggestion, applyingSuggestionKey } = useGovernance();
    
    const stats = useMemo(() => {
        const totalChanges = history.length;
        const aiChanges = history.filter(h => h.changed_by === 'AI').length;
        const userChanges = totalChanges - aiChanges;
        const confidenceScore = 100 - (userChanges / (totalChanges || 1)) * 20; // Simple score logic
        return { totalChanges, aiChanges, userChanges, confidenceScore: Math.round(confidenceScore) };
    }, [history]);
    
    const pieData = [{ name: 'Manual', value: stats.userChanges }, { name: 'IA', value: stats.aiChanges }];
    const COLORS = ['#D2A66D', '#34D399'];

    if (isLoading) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
    }
    
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                 <StatCard title="Total de Alterações" value={stats.totalChanges} icon={BarChart2} />
                 <StatCard title="Score de Confiança" value={`${stats.confidenceScore}%`} icon={ShieldAlert} description="Autonomia do sistema" />
                 <StatCard title="Ajustes Manuais" value={stats.userChanges} icon={User} />
                 <StatCard title="Ajustes por IA" value={stats.aiChanges} icon={Sparkles} />
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Lightbulb size={18}/>Sugestões Preditivas da IA</CardTitle>
                </CardHeader>
                <CardContent>
                    <Button onClick={runAIAdjustment} disabled={isAdjusting} size="sm" className="mb-4">
                        {isAdjusting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                        Analisar e Gerar Novas Sugestões
                    </Button>
                    {suggestions.length > 0 ? (
                        <div className="space-y-2">
                             {suggestions.map((s, i) => (
                                <div key={i} className="border border-primary/50 bg-primary/10 p-3 rounded-lg text-sm">
                                    <p className="font-semibold">{s.key}</p>
                                    <p className="text-xs text-primary/80 mt-1">{s.explanation}</p>
                                    <div className="text-right mt-2">
                                        <Button size="sm" variant="secondary" onClick={() => applySuggestion(s)} disabled={applyingSuggestionKey === s.key}>
                                            Aplicar
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : !isAdjusting && (
                         <p className="text-sm text-textSecondary p-3 bg-secondary rounded-lg">Nenhuma sugestão no momento.</p>
                    )}
                </CardContent>
            </Card>

            <Card>
                 <CardHeader><CardTitle className="flex items-center gap-2"><ShieldAlert size={18}/>Anomalias Detectadas</CardTitle></CardHeader>
                 <CardContent><AnomalyFeed /></CardContent>
            </Card>

            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>Origem das Alterações de Configuração</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                     <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                            <Tooltip formatter={(value) => `${value} alterações`} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
};

export default CognitiveGovernanceDashboard;