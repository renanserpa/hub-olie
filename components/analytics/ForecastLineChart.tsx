import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Sparkles } from 'lucide-react';
import { ForecastData } from '../../hooks/useAnalyticsAI';
import { AnalyticsKPI } from '../../types';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface ForecastLineChartProps {
    title: string;
    kpi: AnalyticsKPI;
    forecast: ForecastData;
}

const ForecastLineChart: React.FC<ForecastLineChartProps> = ({ title, kpi, forecast }) => {
    const currentValue = Number(kpi.value);
    const trendFactor = kpi.trend || 0;
    
    // Simulate 4 historical points leading up to the current value
    const historicalPoints = Array.from({ length: 5 }, (_, i) => ({
        name: `P-${4 - i}`,
        value: currentValue / (1 + trendFactor * (4 - i)),
    }));
    
    const predictedValue = forecast.prediction > 0 ? forecast.prediction : currentValue * (1 + trendFactor); // A simple prediction if AI fails
    
    const chartData = [
        ...historicalPoints,
        { name: 'Previsto', value: predictedValue },
    ];

    const formatValue = (value: number, unit?: string) => {
        const options: Intl.NumberFormatOptions = { notation: 'compact', maximumFractionDigits: 1 };
        if (unit === 'R$') {
            return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', ...options });
        }
        return value.toLocaleString('pt-BR', options);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base font-medium">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                            <YAxis tickFormatter={(value) => formatValue(value, kpi.unit)} tick={{ fontSize: 12 }} />
                            <Tooltip 
                                formatter={(value: number) => [formatValue(value, kpi.unit), kpi.name]}
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--background))',
                                    borderColor: 'hsl(var(--border))',
                                    borderRadius: '0.75rem',
                                }}
                            />
                            <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
                            <Line
                                type="monotone"
                                dataKey="value"
                                stroke="hsl(var(--primary))"
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                dot={false}
                                activeDot={false}
                                legendType="none"
                                connectNulls // This will connect the last historical point to the prediction
                                data={[{ name: 'P-0', value: currentValue }, { name: 'Previsto', value: predictedValue }]}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                 <div className="mt-2 text-xs p-2 bg-primary/10 text-primary/80 rounded-md flex items-start gap-2">
                    <Sparkles size={24} className="flex-shrink-0" />
                    <span>{forecast.insight}</span>
                </div>
            </CardContent>
        </Card>
    );
};

export default ForecastLineChart;