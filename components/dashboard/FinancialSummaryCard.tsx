import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface FinancialSummary {
    upcomingReceivables: number;
    overdueReceivables: number;
    upcomingPayables: number;
    overduePayables: number;
}

interface FinancialSummaryCardProps {
    summary: FinancialSummary;
}

const MetricItem: React.FC<{ icon: React.ElementType, label: string, value: number, colorClass: string }> = ({ icon: Icon, label, value, colorClass }) => (
    <div className="flex items-start gap-3">
        <div className={cn("p-2 rounded-full", colorClass.replace('text-', 'bg-') + '/10')}>
            <Icon className={cn("w-5 h-5", colorClass)} />
        </div>
        <div>
            <p className="text-xs text-textSecondary">{label}</p>
            <p className="text-lg font-bold text-textPrimary">
                {value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
        </div>
    </div>
);

const FinancialSummaryCard: React.FC<FinancialSummaryCardProps> = ({ summary }) => {
    return (
        <Card className="lg:col-span-1">
            <CardHeader>
                <CardTitle className="text-lg">Resumo Financeiro</CardTitle>
                <p className="text-sm text-textSecondary">Próximos 30 dias</p>
            </CardHeader>
            <CardContent className="space-y-6">
                <MetricItem 
                    icon={TrendingUp}
                    label="A Receber"
                    value={summary.upcomingReceivables}
                    colorClass="text-green-600"
                />
                <MetricItem 
                    icon={TrendingDown}
                    label="A Pagar"
                    value={summary.upcomingPayables}
                    colorClass="text-red-600"
                />
                
                {(summary.overdueReceivables > 0 || summary.overduePayables > 0) && (
                    <div className="border-t pt-4 space-y-3">
                        {summary.overdueReceivables > 0 && (
                            <div className="flex items-center gap-2 text-sm text-amber-600">
                                <AlertCircle className="w-4 h-4" />
                                <span>Contas a receber vencidas: <strong>{summary.overdueReceivables.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong></span>
                            </div>
                        )}
                        {summary.overduePayables > 0 && (
                            <div className="flex items-center gap-2 text-sm text-red-700">
                                <AlertCircle className="w-4 h-4" />
                                <span>Contas a pagar vencidas: <strong>{summary.overduePayables.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong></span>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default FinancialSummaryCard;