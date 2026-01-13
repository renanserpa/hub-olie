import React from 'react';
import { AnalyticsKPI } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { BarChart as BarChartIcon } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface ModuleBarChartProps {
    title: string;
    kpis: AnalyticsKPI[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        const value = payload[0].value;
        const unit = data.unit;

        const formattedValue = new Intl.NumberFormat('pt-BR', {
            style: unit === 'R$' ? 'currency' : 'decimal',
            currency: unit === 'R$' ? 'BRL' : undefined,
            maximumFractionDigits: 2,
        }).format(value);

        return (
            <div className="bg-background/80 dark:bg-dark-background/80 backdrop-blur-sm p-2 border rounded-lg shadow-lg">
                <p className="font-semibold">{label}</p>
                <p className="text-primary">{`Valor: ${formattedValue}`}</p>
            </div>
        );
    }
    return null;
};


const ModuleBarChart: React.FC<ModuleBarChartProps> = ({ title, kpis }) => {
    if (!kpis || kpis.length === 0) {
        return (
            <Card>
                <CardHeader><CardTitle className="text-base font-medium">{title}</CardTitle></CardHeader>
                <CardContent>
                    <div className="h-64 flex flex-col items-center justify-center text-center text-textSecondary bg-secondary rounded-lg">
                        <BarChartIcon className="w-10 h-10 text-gray-400 mb-2" />
                        <p className="text-sm font-medium">Dados insuficientes para o gráfico.</p>
                    </div>
                </CardContent>
            </Card>
        );
    }
    
    const chartData = kpis.map(kpi => ({
        name: kpi.name,
        value: Number(kpi.value),
        unit: kpi.unit,
    }));

    const formatYAxis = (value: number) => {
        if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
        if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
        return value.toString();
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base font-medium">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                            <YAxis tickFormatter={formatYAxis} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--accent))' }} />
                            <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};

export default ModuleBarChart;