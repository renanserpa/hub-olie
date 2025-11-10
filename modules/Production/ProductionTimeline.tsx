import React from 'react';
import { ProductionOrder, ProductionTask } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { GanttChartSquare } from 'lucide-react';
import { differenceInDays, format } from 'date-fns';

const ProductionTimeline: React.FC<{ orders: (ProductionOrder & { tasks?: ProductionTask[] })[] }> = ({ orders }) => {

    const { timeRange, startDate } = React.useMemo(() => {
        if (!orders || orders.length === 0) {
            return { timeRange: 30, startDate: new Date() };
        }
        
        const validDates = orders.flatMap(o => o.tasks || [])
            .flatMap(t => [t.started_at, t.finished_at])
            .filter(Boolean)
            .map(d => new Date(d!));
            
        if (validDates.length === 0) {
            const dueDates = orders.map(o => new Date(o.due_date)).filter(d => !isNaN(d.getTime()));
            if (dueDates.length === 0) return { timeRange: 30, startDate: new Date() };
            const minDate = new Date(Math.min(...dueDates.map(d => d.getTime())));
            return { timeRange: 30, startDate: minDate };
        }

        const minDate = new Date(Math.min(...validDates.map(d => d.getTime())));
        const maxDate = new Date(Math.max(...validDates.map(d => d.getTime())));

        const range = differenceInDays(maxDate, minDate) + 1;
        return { timeRange: range > 0 ? range : 30, startDate: minDate };
    }, [orders]);

    const getTaskPosition = (task: ProductionTask) => {
        if (!task.started_at || !task.finished_at) return { left: '0%', width: '0%' };
        
        const start = new Date(task.started_at);
        const end = new Date(task.finished_at);
        
        const left = differenceInDays(start, startDate);
        const width = differenceInDays(end, start) + 1;
        
        const leftPercent = (left / timeRange) * 100;
        const widthPercent = (width / timeRange) * 100;
        
        return { left: `${Math.max(0, leftPercent)}%`, width: `${Math.max(1, widthPercent)}%` };
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><GanttChartSquare size={18}/> Cronograma de Produção (Gantt)</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {orders.map(order => (
                        <div key={order.id} className="p-2 border-b">
                            <h4 className="font-semibold text-sm">{order.po_number} - {order.product?.name}</h4>
                            <div className="relative h-8 mt-2 bg-secondary rounded">
                                {order.tasks && order.tasks.map(task => {
                                    const { left, width } = getTaskPosition(task);
                                    if (width === '0%') return null;
                                    
                                    const statusColor = task.status === 'Concluída' ? 'bg-green-500' : task.status === 'Em Andamento' ? 'bg-blue-500' : 'bg-gray-400';

                                    return (
                                        <div key={task.id} 
                                            className={`absolute h-6 top-1 rounded text-white text-xs flex items-center px-2 ${statusColor}`}
                                            style={{ left, width }}
                                            title={`${task.name} (${task.status})`}
                                        >
                                            <span className="truncate">{task.name}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>
                 <div className="text-center p-6 bg-amber-50 text-amber-800 text-sm rounded-lg border-t mt-6">
                    🚧 Esta é uma visualização simplificada. Um Gantt interativo está em desenvolvimento.
                </div>
            </CardContent>
        </Card>
    );
};

export default ProductionTimeline;