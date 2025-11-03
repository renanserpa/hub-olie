import React from 'react';
import { ProductionOrder } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { SlidersHorizontal } from 'lucide-react';

interface ProductionTimelineProps {
    orders: ProductionOrder[];
}

const ProductionTimeline: React.FC<ProductionTimelineProps> = ({ orders }) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <SlidersHorizontal size={18} />
                    Timeline de Produção (Gantt)
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-center p-6 bg-amber-50 text-amber-800 text-sm rounded-lg">
                    🚧 O componente de gráfico Gantt interativo para visualizar o cronograma e as dependências das tarefas está em desenvolvimento.
                </div>
                {/* Visual Placeholder */}
                <div className="mt-4 space-y-4 font-mono text-xs">
                    {orders.slice(0, 3).map((order, index) => (
                        <div key={order.id} className="flex items-center gap-2">
                            <span className="w-24 truncate text-textSecondary">{order.po_number}</span>
                            <div className="flex-1 h-6 bg-secondary rounded-sm relative">
                                <div className="absolute h-full bg-blue-200 rounded-sm" style={{ left: `${index * 10}%`, width: '20%' }} title="Corte"></div>
                                <div className="absolute h-full bg-indigo-200 rounded-sm" style={{ left: `${20 + index * 10}%`, width: '40%' }} title="Costura"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default ProductionTimeline;