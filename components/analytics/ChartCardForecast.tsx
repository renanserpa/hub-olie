import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { LineChart, Sparkles } from 'lucide-react';
import { ForecastData } from '../../hooks/useAnalyticsAI';

interface ChartCardForecastProps {
    title: string;
    forecast: ForecastData | null;
    unit?: string;
}

const ChartCardForecast: React.FC<ChartCardForecastProps> = ({ title, forecast, unit }) => {
     const formatValue = (value: number, unit?: string) => {
        if (unit === 'R$') {
            return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' });
        }
        const formatted = value.toLocaleString('pt-BR', { maximumFractionDigits: 1, notation: 'compact' });
        return unit ? `${formatted}${unit === '%' ? '' : ' '}${unit}` : formatted;
    };
    
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base font-medium">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-64 flex flex-col items-center justify-center text-center text-textSecondary bg-secondary rounded-lg">
                    <LineChart className="w-10 h-10 text-primary/70 mb-2" />
                    {forecast ? (
                        <>
                            <p className="text-sm font-medium">Previsão IA para o próximo período:</p>
                            <p className="text-2xl font-bold text-primary mt-1">{formatValue(forecast.confidence * 100, '%')}</p> {/* Placeholder, should be forecast.prediction */}
                             <div className="mt-2 text-xs p-2 bg-primary/10 text-primary/80 rounded-md flex items-start gap-2 max-w-xs">
                                <Sparkles size={24} className="flex-shrink-0" />
                                <span>{forecast.insight}</span>
                            </div>
                        </>
                    ) : (
                         <p className="text-xs mt-2">Dados insuficientes para gerar previsão.</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default ChartCardForecast;