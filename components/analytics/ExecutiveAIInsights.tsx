import React, { useState } from 'react';
import { AIInsight, ExecutiveKPI } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Sparkles, Lightbulb, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { analyticsAiService } from '../../services/analyticsAiService';
import { toast } from '../../hooks/use-toast';

interface ExecutiveAIInsightsProps {
    insights: AIInsight[];
    kpis: ExecutiveKPI[];
}

const insightConfig = {
    opportunity: { icon: Lightbulb, color: 'bg-blue-100 text-blue-800 border-blue-200' },
    positive: { icon: CheckCircle, color: 'bg-green-100 text-green-800 border-green-200' },
    risk: { icon: AlertTriangle, color: 'bg-red-100 text-red-800 border-red-200' },
};

const ExecutiveAIInsights: React.FC<ExecutiveAIInsightsProps> = ({ insights, kpis }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedSummary, setGeneratedSummary] = useState('');
    
    const handleGenerateSummary = async () => {
        setIsGenerating(true);
        setGeneratedSummary('');
        try {
            const summary = await analyticsAiService.insightGeneratorAI(kpis);
            setGeneratedSummary(summary);
            toast({ title: "Sucesso!", description: "Análise da IA gerada."});
        } catch (error) {
            toast({ title: "Erro de IA", description: (error as Error).message, variant: "destructive" });
        } finally {
            setIsGenerating(false);
        }
    };
    
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex-row items-center justify-between">
                    <CardTitle>Análise Descritiva (IA)</CardTitle>
                    <Button onClick={handleGenerateSummary} disabled={isGenerating}>
                        {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                        Gerar Novo Resumo
                    </Button>
                </CardHeader>
                <CardContent>
                    {generatedSummary && (
                        <div className="p-4 bg-secondary rounded-lg prose prose-sm max-w-none">
                            <ul className="space-y-2">
                                {generatedSummary.split('*').filter(s => s.trim()).map((line, index) => (
                                    <li key={index}>{line.trim()}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {!generatedSummary && (
                        <p className="text-sm text-textSecondary">Clique no botão para gerar um resumo executivo automático com base nos KPIs atuais.</p>
                    )}
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {insights.map(insight => {
                    const config = insightConfig[insight.type];
                    const Icon = config.icon;
                    return (
                        <div key={insight.id} className={cn("p-4 border rounded-lg", config.color)}>
                            <div className="flex items-center gap-2 mb-2">
                                <Icon className="w-5 h-5" />
                                <h4 className="font-semibold capitalize">{insight.type}</h4>
                            </div>
                            <p className="text-sm">{insight.insight}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ExecutiveAIInsights;