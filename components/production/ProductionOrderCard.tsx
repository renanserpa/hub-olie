import React from 'react';
import { ProductionOrder } from '../../types';
import { cn } from '../../lib/utils';
import { GripVertical, Package, User, Calendar } from 'lucide-react';

interface ProductionOrderCardProps {
    order: ProductionOrder;
    onClick: () => void;
    onDragStart?: (e: React.DragEvent<HTMLDivElement>) => void;
    onDragEnd?: (e: React.DragEvent<HTMLDivElement>) => void;
}

const ProductionOrderCard: React.FC<ProductionOrderCardProps> = ({ order, onClick, onDragStart, onDragEnd }) => {
    
    // Fix: Card is only draggable if drag handler functions are provided.
    const isDraggable = !!(onDragStart && onDragEnd);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        e.currentTarget.classList.add('opacity-50', 'shadow-2xl', 'rotate-3', 'scale-105');
        onDragStart?.(e);
    };
    
    const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
        e.currentTarget.classList.remove('opacity-50', 'shadow-2xl', 'rotate-3', 'scale-105');
        onDragEnd?.(e);
    };

    const formatDate = (dateValue?: any) => {
        if (!dateValue) return '-';
        const date = dateValue.toDate ? dateValue.toDate() : new Date(dateValue);
        if (isNaN(date.getTime())) return '-';
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    };

    const progress = order.steps_total > 0 ? (order.steps_completed / order.steps_total) * 100 : 0;

    return (
        <div
            draggable={isDraggable}
            onDragStart={isDraggable ? handleDragStart : undefined}
            onDragEnd={isDraggable ? handleDragEnd : undefined}
            onClick={onClick}
            className={cn(
                "p-3 rounded-lg shadow-sm border bg-card dark:bg-dark-background border-border dark:border-dark-border hover:shadow-md hover:border-primary/50 transition-all duration-200 group",
                isDraggable ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"
            )}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-textPrimary dark:text-dark-textPrimary truncate font-mono">{order.po_number}</p>
                    <p className="text-xs text-textSecondary dark:text-dark-textSecondary truncate">{order.product?.name}</p>
                </div>
                {isDraggable && (
                    <div className="text-textSecondary/50 group-hover:text-textSecondary dark:text-dark-textSecondary/50 dark:group-hover:text-dark-textSecondary">
                        <GripVertical size={18} />
                    </div>
                )}
            </div>

            <div className="mt-3 space-y-2 text-xs text-textSecondary dark:text-dark-textSecondary">
                <div className="flex items-center gap-2">
                    <Package size={14} />
                    <span>{order.quantity} unidades</span>
                </div>
                {order.operator && (
                    <div className="flex items-center gap-2">
                        <User size={14} />
                        <span>{order.operator}</span>
                    </div>
                )}
                <div className="flex items-center gap-2">
                    <Calendar size={14} />
                    <span>Prazo: {formatDate(order.due_date)}</span>
                </div>
            </div>

            <div className="mt-3">
                <div className="flex justify-between items-center text-xs text-textSecondary dark:text-dark-textSecondary mb-1">
                    <span>Progresso</span>
                    <span>{order.steps_completed}/{order.steps_total}</span>
                </div>
                <div className="w-full bg-secondary dark:bg-dark-secondary rounded-full h-1.5">
                    <div className="bg-primary h-1.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                </div>
            </div>
        </div>
    );
};

export default ProductionOrderCard;
