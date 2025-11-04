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
    { id: 'em_espera', label: 'Em Espera' },
    { id: 'finalizado', label: 'Concluídas' },
];

const ProductionKanban: React.FC<ProductionKanbanProps> = ({ orders, onCardClick, onStatusChange }) => {
    const [draggedOrderId, setDraggedOrderId] = useState<string | null>(null);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, orderId: string) => {
        setDraggedOrderId(orderId);
        e.dataTransfer.setData('orderId', orderId);
    };
    
    const handleDragEnd = () => {
        setDraggedOrderId(null);
    };
    
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };
    
    const handleDrop = (e: React.DragEvent<HTMLDivElement>, newStatus: ProductionOrderStatus) => {
        e.preventDefault();
        const orderId = e.dataTransfer.getData('orderId');
        if (orderId) {
            onStatusChange(orderId, newStatus);
        }
    };

    return (
        <div className="flex gap-4 overflow-x-auto pb-4">
            {COLUMNS.map(column => (
                <div 
                    key={column.id}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, column.id)}
                    className="w-80 flex-shrink-0 bg-secondary dark:bg-dark-secondary p-3 rounded-xl"
                >
                    <div className="flex justify-between items-center mb-4 px-1">
                        <h3 className="font-semibold text-sm text-textPrimary dark:text-dark-textPrimary">{column.label}</h3>
                        <span className="text-xs font-medium text-textSecondary dark:text-dark-textSecondary bg-background dark:bg-dark-background px-2 py-1 rounded-full">
                            {orders.filter(o => o.status === column.id).length}
                        </span>
                    </div>
                    <div className="space-y-3 min-h-[200px]">
                        {orders
                            .filter(order => order.status === column.id)
                            .map(order => (
                                <div
                                    key={order.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, order.id)}
                                    onDragEnd={handleDragEnd}
                                >
                                    <ProductionOrderCard order={order} onClick={() => onCardClick(order.id)} />
                                </div>
                            ))
                        }
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ProductionKanban;