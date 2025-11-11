import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Loader2, Sparkles, Lightbulb, Check, X, ShieldAlert } from 'lucide-react';
import { Button } from '../ui/Button';
import { useGovernance } from '../../hooks/useGovernance';
import { useAnomalies } from '../../hooks/useAnomalies';
import { cn } from '../../lib/utils';
import { Badge } from '../ui/Badge';

const AnomalyFeed: React.FC = () => {
    const { anomalies, isLoading } = useAnomalies();

    if (isLoading) {
        return <div className="flex justify-center p-4"><Loader2 className="w-4 h-4 animate-spin" /></div>;
    }

    if (anomalies.length === 0) {
        return <p className="text-xs text-textSecondary p-3 bg-secondary rounded-lg">Nenhuma anomalia detectada recentemente.</p>;
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
    };

    return (
        <div className="space-y-2 max-h-64 overflow-y-auto">
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
    const { suggestions, isLoading, isAdjusting, isSubmitting, runAIAnalysis, updateSuggestionStatus } = useGovernance();
    
    const pendingSuggestions = suggestions.filter(s => s.status === 'suggested');

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Lightbulb size={18}/>Sugestões Preditivas da IA</CardTitle>
                </CardHeader>
                <CardContent>
                    <Button onClick={runAIAnalysis} disabled={isAdjusting} size="sm" className="mb-4">
                        {isAdjusting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                        Analisar e Gerar Novas Sugestões
                    </Button>
                    {isLoading ? (
                        <div className="flex justify-center p-4"><Loader2 className="w-5 h-5 animate-spin"/></div>
                    ) : pendingSuggestions.length > 0 ? (
                        <div className="space-y-3">
                             {pendingSuggestions.map((s) => (
                                <div key={s.id} className="border border-primary/50 bg-primary/10 p-3 rounded-lg text-sm">
                                    <p className="font-semibold text-textPrimary">Ajustar: <span className="text-primary font-mono">{s.setting_key}</span></p>
                                    <p className="text-xs text-textSecondary mt-1">{s.explanation}</p>
                                    <div className="text-right mt-3 flex justify-end gap-2">
                                        <Button size="sm" variant="ghost" className="text-red-600" onClick={() => updateSuggestionStatus(s, 'rejected')} disabled={isSubmitting}><X size={14} className="mr-1"/>Rejeitar</Button>
                                        <Button size="sm" variant="secondary" onClick={() => updateSuggestionStatus(s, 'accepted')} disabled={isSubmitting}>
                                            <Check size={14} className="mr-1"/>Aceitar e Aplicar
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                         <p className="text-sm text-textSecondary p-3 bg-secondary rounded-lg">Nenhuma sugestão pendente no momento.</p>
                    )}
                </CardContent>
            </Card>

            <Card>
                 <CardHeader><CardTitle className="flex items-center gap-2"><ShieldAlert size={18}/>Feed de Anomalias (Real-time)</CardTitle></CardHeader>
                 <CardContent><AnomalyFeed /></CardContent>
            </Card>
        </div>
    );
};

export default CognitiveGovernanceDashboard;