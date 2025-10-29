import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { BarChart2 } from 'lucide-react';
import { ExecutiveKPI } from '../../types';
import { cn } from '../../lib/utils';

interface TrendBarProps {
    trend: number;
}

const TrendBar: React.FC<TrendBarProps> = ({ trend }) => {
    const percentage = Math.abs(trend * 100);
    const isPositive = trend >= 0;
    // Cap bar width at 100% for visual consistency, even if trend is > 100%
    const barWidth = Math.min(percentage, 100); 

    return (
        <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden" title={`${(trend * 100).toFixed(1)}%`}>
            <div
                className={cn('h-2 rounded-full transition-all duration-300', isPositive ? 'bg-green-500' : 'bg-red-500')}
                style={{ width: `${barWidth}%` }}
            ></div>
        </div>
    );
};

interface ExecutiveChartCardProps {
    title: string;
    kpis: ExecutiveKPI[];
}

const ExecutiveChartCard: React.FC<ExecutiveChartCardProps> = ({ title, kpis }) => (
    <Card>
        <CardHeader>
            <CardTitle className="text-base font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent>
            {kpis && kpis.length > 0 ? (
                <div className="space-y-4">
                    {kpis.map((kpi, index) => (
                        <div key={kpi.id} className="flex items-center justify-between gap-4 animate-fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
                            <span className="text-sm text-textPrimary flex-1 truncate" title={kpi.name}>{kpi.name}</span>
                            <div className="flex items-center gap-3">
                                <TrendBar trend={kpi.trend} />
                                <span className={cn(
                                    "text-sm font-semibold w-16 text-right",
                                    kpi.trend > 0 ? "text-green-600" : kpi.trend < 0 ? "text-red-600" : "text-gray-500"
                                )}>
                                    {kpi.trend >= 0 ? '+' : ''}{(kpi.trend * 100).toFixed(1)}%
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                 <div className="h-48 flex flex-col items-center justify-center text-center text-textSecondary bg-secondary rounded-lg">
                    <BarChart2 className="w-10 h-10 text-gray-400 mb-2" />
                    <p className="text-sm font-medium">Dados de tendência indisponíveis</p>
                </div>
            )}
        </CardContent>
    </Card>
);

export default ExecutiveChartCard;