import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { LineChart } from 'lucide-react';

interface ChartCardForecastProps {
    title: string;
    prediction: number;
    unit?: string;
}

const ChartCardForecast: React.FC<ChartCardForecastProps> = ({ title, prediction, unit }) => {
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
                    <LineChart className="w-10 h-10 text-gray-400 mb-2" />
                    <p className="text-sm font-medium">Previsão IA para o próximo período:</p>
                    <p className="text-2xl font-bold text-primary mt-1">{formatValue(prediction, unit)}</p>
                    <p className="text-xs mt-2">(Componente de gráfico em desenvolvimento)</p>
                </div>
            </CardContent>
        </Card>
    );
};

export default ChartCardForecast;
