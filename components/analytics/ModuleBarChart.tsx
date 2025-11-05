import React from 'react';
import { AnalyticsKPI } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { BarChart2 } from 'lucide-react';

interface ModuleBarChartProps {
    title: string;
    kpis: AnalyticsKPI[];
}

const ModuleBarChart: React.FC<ModuleBarChartProps> = ({ title, kpis }) => {
    if (!kpis || kpis.length === 0) {
        return (
            <Card>
                <CardHeader><CardTitle className="text-base font-medium">{title}</CardTitle></CardHeader>
                <CardContent>
                    <div className="h-64 flex flex-col items-center justify-center text-center text-textSecondary bg-secondary rounded-lg">
                        <BarChart2 className="w-10 h-10 text-gray-400 mb-2" />
                        <p className="text-sm font-medium">Dados insuficientes para o gráfico.</p>
                    </div>
                </CardContent>
            </Card>
        );
    }
    
    const chartHeight = 200;
    const barWidth = 40;
    const gap = 20;
    const maxValue = Math.max(...kpis.map(k => Number(k.value)), 1) * 1.2; // Add 20% padding

    const formatValue = (value: number, unit?: string) => {
        if (unit === 'R$') {
            return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' });
        }
        return value.toLocaleString('pt-BR', { notation: 'compact', maximumFractionDigits: 1 });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base font-medium">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-64 overflow-x-auto">
                    <svg width={kpis.length * (barWidth + gap)} height={chartHeight} className="font-sans">
                        {kpis.map((kpi, index) => {
                            const value = Number(kpi.value);
                            const barHeight = (value / maxValue) * (chartHeight - 30);
                            const x = index * (barWidth + gap) + gap / 2;
                            const y = chartHeight - barHeight - 20;

                            return (
                                <g key={kpi.id} className="group">
                                    <rect
                                        x={x}
                                        y={y}
                                        width={barWidth}
                                        height={barHeight}
                                        fill="currentColor"
                                        className="text-primary/20 group-hover:text-primary/40 transition-colors"
                                    />
                                    <text
                                        x={x + barWidth / 2}
                                        y={y - 5}
                                        textAnchor="middle"
                                        className="text-xs font-bold fill-current text-primary"
                                    >
                                        {formatValue(value, kpi.unit)}
                                    </text>
                                    <text
                                        x={x + barWidth / 2}
                                        y={chartHeight - 5}
                                        textAnchor="middle"
                                        className="text-xs fill-current text-textSecondary truncate"
                                    >
                                        {kpi.name.substring(0, 10)}
                                    </text>
                                </g>
                            );
                        })}
                    </svg>
                </div>
            </CardContent>
        </Card>
    );
};

export default ModuleBarChart;
