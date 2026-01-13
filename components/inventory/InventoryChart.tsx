import React from 'react';
import { BarChart as BarChartIcon } from 'lucide-react';
import { InventoryMovement, Material } from '../../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';
import { format } from 'date-fns';

interface InventoryChartProps {
    movements: InventoryMovement[];
    material: Material;
}

const InventoryChart: React.FC<InventoryChartProps> = ({ movements, material }) => {

    if (!movements || movements.length === 0) {
        return (
            <div className="h-48 flex flex-col items-center justify-center text-center text-textSecondary dark:text-dark-textSecondary bg-secondary dark:bg-dark-secondary rounded-lg my-6">
                <BarChartIcon className="w-10 h-10 text-gray-400 mb-2" />
                <p className="text-sm font-medium">Movimentações de Estoque</p>
                <p className="text-xs">(Sem dados para gerar gráfico)</p>
            </div>
        );
    }
    
    const chartData = [...movements].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        .map(m => ({
            date: new Date(m.created_at),
            quantity: m.quantity,
            reason: m.reason,
        }));
    
    const formatDate = (date: Date) => format(date, 'dd/MM');

    return (
        <div className="h-48 w-full my-6">
            <h4 className="font-semibold text-md mb-2">Movimentações Recentes</h4>
            <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                        dataKey="date" 
                        tickFormatter={formatDate}
                        tick={{ fontSize: 12 }} 
                    />
                    <YAxis 
                        tick={{ fontSize: 12 }} 
                        label={{ value: material.unit, position: 'insideLeft', angle: -90, dy: 10, fontSize: 12 }}
                    />
                    <Tooltip 
                        labelFormatter={(label) => new Date(label).toLocaleString('pt-BR')}
                        formatter={(value: number, name, props) => [`${value} ${material.unit}`, props.payload.reason]}
                         contentStyle={{
                            backgroundColor: 'hsl(var(--background-a, var(--background)))',
                            borderColor: 'hsl(var(--border))',
                            borderRadius: '0.75rem',
                            backdropFilter: 'blur(4px)',
                        }}
                    />
                    <Bar dataKey="quantity">
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.quantity >= 0 ? '#16a34a' : '#ef4444'} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default InventoryChart;