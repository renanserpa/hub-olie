import React from 'react';
import { AnalyticsKPI } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { cn } from '../../lib/utils';
import KpiAnomalyBadge from './KpiAnomalyBadge';

interface KpiCardProps {
    kpi: AnalyticsKPI;
    anomaly?: { isAnomaly: boolean; reason: string; };
}

const TrendIcon: React.FC<{ trend?: number }> = ({ trend }) => {
    if (trend === undefined || trend === 0) {
        return <Minus size={14} className="text-gray-500" />;
    }
    if (trend > 0) {
        return <ArrowUp size={14} className="text-green-500" />;
    }
    return <ArrowDown size={14} className="text-red-500" />;
};

const KpiCard: React.FC<KpiCardProps> = ({ kpi, anomaly }) => {
    const formatValue = (value: string | number, unit?: string) => {
        if (typeof value === 'number') {
            const options: Intl.NumberFormatOptions = {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
            };
            if (unit === 'R$') {
                options.style = 'currency';
                options.currency = 'BRL';
                return value.toLocaleString('pt-BR', options);
            }
            const formatted = value.toLocaleString('pt-BR', options);
            return unit ? `${formatted}${unit === '%' ? '' : ' '}${unit}` : formatted;
        }
        return value;
    };
    
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-textSecondary">{kpi.name}</CardTitle>
                {anomaly && <KpiAnomalyBadge isAnomaly={anomaly.isAnomaly} reason={anomaly.reason} />}
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-semibold text-textPrimary">{formatValue(kpi.value, kpi.unit)}</div>
                <div className="text-xs text-textSecondary flex items-center gap-1 mt-1">
                    {kpi.trend !== undefined && (
                        <span className={cn("flex items-center font-semibold", kpi.trend > 0 ? "text-green-600" : kpi.trend < 0 ? "text-red-600" : "text-gray-500")}>
                            <TrendIcon trend={kpi.trend} />
                            {(Math.abs(kpi.trend) * 100).toFixed(1)}%
                        </span>
                    )}
                    <span>vs. período anterior</span>
                </div>
            </CardContent>
        </Card>
    );
};

export default KpiCard;