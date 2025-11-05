import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { LineChart, Sparkles } from 'lucide-react';
import { ForecastData } from '../../hooks/useAnalyticsAI';
import { AnalyticsKPI } from '../../types';

interface ForecastLineChartProps {
    title: string;
    kpi: AnalyticsKPI;
    forecast: ForecastData;
}

const ForecastLineChart: React.FC<ForecastLineChartProps> = ({ title, kpi, forecast }) => {
    const chartWidth = 400;
    const chartHeight = 180;

    // Simulate 4 historical points leading up to the current value
    const currentValue = Number(kpi.value);
    const trendFactor = kpi.trend || 0;
    const historicalPoints = [
        currentValue / (1 + trendFactor * 4),
        currentValue / (1 + trendFactor * 3),
        currentValue / (1 + trendFactor * 2),
        currentValue / (1 + trendFactor * 1),
        currentValue
    ];

    const allValues = [...historicalPoints, forecast.confidence * 100]; // Placeholder prediction value
    const maxValue = Math.max(...allValues) * 1.2;
    const minValue = Math.min(...allValues) * 0.8;
    const range = maxValue - minValue;

    const toPath = (points: number[]) => {
        return points.map((p, i) => {
            const x = (i / (points.length - 1)) * (chartWidth - 40) + 20;
            const y = chartHeight - 20 - ((p - minValue) / range) * (chartHeight - 40);
            return `${x},${y}`;
        }).join(' ');
    };

    const historicalPath = toPath(historicalPoints);
    const lastHistoricalPoint = historicalPath.split(' ').pop()?.split(',');
    const forecastX = chartWidth - 20;
    const forecastY = chartHeight - 20 - ((forecast.confidence * 100 - minValue) / range) * (chartHeight - 40); // Placeholder prediction value

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base font-medium">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-auto">
                    <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto font-sans">
                        {/* Historical Line */}
                        <polyline
                            points={historicalPath}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="text-primary/50"
                        />

                        {/* Forecast Line */}
                        {lastHistoricalPoint && (
                             <line
                                x1={lastHistoricalPoint[0]}
                                y1={lastHistoricalPoint[1]}
                                x2={forecastX}
                                y2={forecastY}
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeDasharray="4 4"
                                className="text-primary"
                             />
                        )}
                       
                        {/* Forecast Point */}
                        <circle cx={forecastX} cy={forecastY} r="4" fill="currentColor" className="text-primary" />
                        
                         {/* Historical Points */}
                        {historicalPoints.map((p, i) => {
                             const x = (i / (historicalPoints.length - 1)) * (chartWidth - 40) + 20;
                             const y = chartHeight - 20 - ((p - minValue) / range) * (chartHeight - 40);
                             return <circle key={i} cx={x} cy={y} r="3" fill="currentColor" className="text-primary/50" />;
                        })}
                    </svg>
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
