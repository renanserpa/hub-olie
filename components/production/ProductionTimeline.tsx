import React, { useMemo } from 'react';
import { ProductionOrder } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { SlidersHorizontal } from 'lucide-react';
import { format, differenceInDays, parseISO } from 'date-fns';

interface ProductionTimelineProps {
    orders: ProductionOrder[];
}

const TASK_COLORS = ['bg-blue-300', 'bg-indigo-300', 'bg-purple-300', 'bg-pink-300', 'bg-sky-300'];

const ProductionTimeline: React.FC<ProductionTimelineProps> = ({ orders }) => {

    const { timeRange, startDate } = useMemo(() => {
        if (orders.length === 0) return { timeRange: 30, startDate: new Date() };

        const dates = orders.flatMap(o => o.tasks?.map(t => parseISO(t.started_at || o.created_at)) || [parseISO(o.created_at)]);
        const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
        const maxDate = new Date(Math.max(...dates.map(d => d.getTime()), new Date().getTime()));
        
        const range = Math.max(differenceInDays(maxDate, minDate) + 2, 10);
        return { timeRange: range, startDate: minDate };

    }, [orders]);

    const getTaskStyle = (task: ProductionOrder['tasks'][0], orderStartDate: Date) => {
        const start = task.started_at ? parseISO(task.started_at) : orderStartDate;
        const end = task.finished_at ? parseISO(task.finished_at) : new Date(start.getTime() + 86400000); // Assume 1 day duration if not finished
        
        const startDay = differenceInDays(start, startDate);
        const duration = Math.max(differenceInDays(end, start), 1);
        
        const left = (startDay / timeRange) * 100;
        const width = (duration / timeRange) * 100;

        return { left: `${left}%`, width: `${width}%` };
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <SlidersHorizontal size={18} />
                    Timeline de Produção (Gantt)
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-center p-6 bg-amber-50 text-amber-800 text-sm rounded-lg mb-4">
                    🚧 Esta é uma simulação visual. Um componente de Gantt interativo está em desenvolvimento.
                </div>

                <div className="relative overflow-x-auto">
                     {/* Header */}
                    <div className="flex text-xs text-textSecondary mb-2 sticky top-0 bg-card z-10">
                        <div className="w-40 flex-shrink-0 font-semibold p-2">Ordem de Produção</div>
                        <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${timeRange}, 1fr)`}}>
                            {[...Array(timeRange)].map((_, i) => (
                                <div key={i} className="text-center border-l text-[10px] p-1">
                                    {format(new Date(startDate.getTime() + i * 86400000), 'dd/MM')}
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Rows */}
                    <div className="space-y-2">
                        {orders.map((order) => (
                            <div key={order.id} className="flex items-center border-t">
                                <div className="w-40 flex-shrink-0 p-2 text-xs font-medium truncate" title={order.po_number}>{order.po_number}</div>
                                <div className="flex-1 h-8 relative">
                                    {order.tasks?.map((task, i) => (
                                        <div 
                                            key={task.id}
                                            className={`absolute h-6 top-1 rounded-sm ${TASK_COLORS[i % TASK_COLORS.length]} flex items-center justify-center text-[10px] text-white font-semibold overflow-hidden`}
                                            style={getTaskStyle(task, parseISO(order.created_at))}
                                            title={`${task.name} (${task.status})`}
                                        >
                                           <span className="truncate px-1">{task.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default ProductionTimeline;