import React, { useState } from 'react';
import { ProductionOrder, ProductionOrderStatus } from '../../types';
import ProductionOrderCard from './ProductionOrderCard';
import { cn } from '../../lib/utils';

interface ProductionKanbanProps {
  orders: ProductionOrder[];
  onCardClick: (id: string) => void;
  onStatusChange: (orderId: string, newStatus: ProductionOrderStatus) => void;
}

const COLUMNS: { id: ProductionOrderStatus, label: string }[] = [
    { id: 'novo', label: 'Novas' },
    { id: 'planejado', label: 'Planejadas' },
    { id: 'em_andamento', label: 'Em Produção' },
    { id: 'finalizado', label: 'Concluídas' },
];

const ProductionKanban: React.FC<ProductionKanbanProps> = ({ orders, onCardClick, onStatusChange }) => {
    const [isDraggingOver, setIsDraggingOver] = useState<ProductionOrderStatus | null>(null);

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>, status: ProductionOrderStatus) => {
        e.preventDefault();
        setIsDraggingOver(status);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDraggingOver(null);
    }
    
    const handleDrop = (e: React.DragEvent<HTMLDivElement>, newStatus: ProductionOrderStatus) => {
        e.preventDefault();
        setIsDraggingOver(null);
        const orderId = e.dataTransfer.getData('orderId');
        if (orderId) {
            const order = orders.find(o => o.id === orderId);
            if (order && order.status !== newStatus) {
                onStatusChange(orderId, newStatus);
            }
        }
    };

    return (
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6">
            {COLUMNS.map(column => {
                const columnOrders = orders.filter(o => o.status === column.id);
                return (
                    <div 
                        key={column.id}
                        onDragOver={(e) => handleDragOver(e, column.id)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, column.id)}
                        className={cn(
                            "w-80 flex-shrink-0 bg-secondary p-3 rounded-xl transition-colors duration-200",
                            isDraggingOver === column.id && "bg-primary/10"
                        )}
                    >
                        <div className="flex justify-between items-center mb-4 px-1">
                            <h3 className="font-semibold text-sm text-textPrimary">{column.label}</h3>
                            <span className="text-xs font-medium text-textSecondary bg-background px-2 py-1 rounded-full">
                                {columnOrders.length}
                            </span>
                        </div>
                        <div className="space-y-3 min-h-[200px]">
                            {columnOrders.map(order => (
                                <ProductionOrderCard 
                                    key={order.id} 
                                    order={order} 
                                    isSelected={false} 
                                    onClick={() => onCardClick(order.id)} 
                                />
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ProductionKanban;