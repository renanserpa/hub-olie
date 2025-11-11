import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Sparkles } from 'lucide-react';
// FIX: Import PredictionData type to correctly type the new prop.
import { ForecastData, PredictionData } from '../../hooks/useAnalyticsAI';
import { AnalyticsKPI } from '../../types';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface ForecastLineChartProps {
    title: string;
    kpi: AnalyticsKPI;
    forecast: ForecastData;
    // FIX: Add prediction prop to receive the predicted value.
    prediction: PredictionData;
}

const ForecastLineChart: React.FC<ForecastLineChartProps> = ({ title, kpi, forecast, prediction }) => {
    const currentValue = Number(kpi.value);
    const trendFactor = kpi.trend || 0;
    
    // Simulate 4 historical points leading up to the current value
    const historicalPoints = Array.from({ length: 5 }, (_, i) => ({
        name: `P-${4 - i}`,
        value: currentValue / (1 + trendFactor * (4 - i)),
    }));
    
    // FIX: Use the 'prediction' prop to get the predicted value.
    const predictedValue = prediction.prediction > 0 ? prediction.prediction : currentValue * (1 + trendFactor); // A simple prediction if AI fails
    
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
                                    backdropFilter: 'blur(4px)',
                                }}
                            />
                            <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                {forecast && (
                    <div className="mt-4 p-3 bg-primary/10 rounded-lg text-sm flex items-start gap-3">
                        <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-semibold text-primary">Análise Preditiva (IA)</p>
                            <p className="text-textSecondary">{forecast.insight}</p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default ForecastLineChart;
