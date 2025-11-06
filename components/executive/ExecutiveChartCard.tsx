import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { BarChart2 } from 'lucide-react';
import { ExecutiveKPI } from '../../types';
import { cn } from '../../lib/utils';
// FIX: Imported 'CartesianGrid' from 'recharts' to resolve the 'Cannot find name' error.
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, CartesianGrid } from 'recharts';

interface ExecutiveChartCardProps {
    title: string;
    kpis: ExecutiveKPI[];
}

const ExecutiveChartCard: React.FC<ExecutiveChartCardProps> = ({ title, kpis }) => {
    
    const chartData = kpis.map(kpi => ({
        name: kpi.name,
        trend: kpi.trend * 100, // as percentage
    }));

    return (
    <Card>
        <CardHeader>
            <CardTitle className="text-base font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent>
            {kpis && kpis.length > 0 ? (
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis type="number" unit="%" tick={{ fontSize: 10 }} />
                            <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 10 }} tickLine={false} />
                            <Tooltip formatter={(value: number) => [`${value.toFixed(1)}%`, 'Tendência']} />
                            <Bar dataKey="trend" barSize={20}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.trend >= 0 ? '#16a34a' : '#ef4444'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
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
};

export default ExecutiveChartCard;
