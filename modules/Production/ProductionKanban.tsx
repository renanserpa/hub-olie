import React, { useState } from 'react';
import { ProductionOrder, ProductionOrderStatus } from '../../types';
import ProductionOrderCard from './ProductionOrderCard';
import { cn } from '../../lib/utils';
import { PlusCircle, ClipboardList, Cog, PauseCircle, CheckCircle2 } from 'lucide-react';

interface ProductionKanbanProps {
  orders: (ProductionOrder & { customer_name?: string, item_count?: number })[];
  onCardClick: (id: string) => void;
  onStatusChange: (orderId: string, newStatus: ProductionOrderStatus) => void;
}

const STATUS_CONFIG: { id: ProductionOrderStatus, label: string, icon: React.ElementType, color: string }[] = [
    { id: 'novo', label: 'Novas', icon: PlusCircle, color: 'border-gray-400' },
    { id: 'planejado', label: 'Planejadas', icon: ClipboardList, color: 'border-blue-500' },
    { id: 'em_andamento', label: 'Em Produção', icon: Cog, color: 'border-indigo-500' },
    { id: 'em_espera', label: 'Em Espera', icon: PauseCircle, color: 'border-yellow-500' },
    { id: 'finalizado', label: 'Concluídas', icon: CheckCircle2, color: 'border-green-500' },
];

const ProductionKanban: React.FC<ProductionKanbanProps> = ({ orders, onCardClick, onStatusChange }) => {
    const [isDraggingOver, setIsDraggingOver] = useState<ProductionOrderStatus | null>(null);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, orderId: string) => {
        e.dataTransfer.setData('orderId', orderId);
    };
    
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>, status: ProductionOrderStatus) => {
        e.preventDefault();
        setIsDraggingOver(status);
    };
    
    const handleDrop = (e: React.DragEvent<HTMLDivElement>, newStatus: ProductionOrderStatus) => {
        e.preventDefault();
        setIsDraggingOver(null);
        const orderId = e.dataTransfer.getData('orderId');
        if (orderId) {
            onStatusChange(orderId, newStatus);
        }
    };

    return (
        <div className="flex gap-4 overflow-x-auto pb-4">
            {STATUS_CONFIG.map(column => {
                const { icon: Icon, color } = column;
                const columnOrders = orders.filter(o => o.status === column.id);
                return (
                    <div 
                        key={column.id}
                        onDragOver={(e) => handleDragOver(e, column.id)}
                        onDragLeave={() => setIsDraggingOver(null)}
                        onDrop={(e) => handleDrop(e, column.id)}
                        className={cn(
                            "w-80 flex-shrink-0 bg-secondary dark:bg-dark-secondary rounded-xl flex flex-col transition-colors duration-200",
                            isDraggingOver === column.id && "bg-primary/10"
                        )}
                    >
                        <div className={cn("p-3 border-t-4 rounded-t-lg", color)}>
                            <div className="flex justify-between items-center">
                                <h3 className="font-semibold text-sm text-textPrimary flex items-center gap-2">
                                    <Icon size={16} className="text-textSecondary" />
                                    {column.label}
                                </h3>
                                <span className="text-xs font-medium text-textSecondary bg-background px-2 py-1 rounded-full">
                                    {columnOrders.length}
                                </span>
                            </div>
                        </div>

                        <div className="p-3 space-y-3 overflow-y-auto min-h-[200px] flex-grow">
                            {columnOrders.map(order => (
                                <ProductionOrderCard
                                    key={order.id}
                                    order={order}
                                    onClick={() => onCardClick(order.id)}
                                    onDragStart={(e) => handleDragStart(e, order.id)}
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