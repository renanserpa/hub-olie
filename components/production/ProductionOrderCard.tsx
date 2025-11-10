import React from 'react';
import { ProductionOrder } from '../../types';
import { Card } from '../ui/Card';
import { cn } from '../../lib/utils';
import { Badge } from '../ui/Badge';
import { Calendar, Package } from 'lucide-react';

interface ProductionOrderCardProps {
    order: ProductionOrder;
    onClick: () => void;
    onDragStart?: (e: React.DragEvent<HTMLDivElement>) => void;
    onDragEnd?: () => void;
}

const ProductionOrderCard: React.FC<ProductionOrderCardProps> = ({ order, onClick, onDragStart, onDragEnd }) => {
    const handleInternalDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        e.dataTransfer.setData('orderId', order.id);
        e.currentTarget.style.opacity = '0.5';
        e.currentTarget.classList.add('shadow-lg', 'rotate-3');
        if (onDragStart) onDragStart(e);
    };
    
    const handleInternalDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
        e.currentTarget.style.opacity = '1';
        e.currentTarget.classList.remove('shadow-lg', 'rotate-3');
        if (onDragEnd) onDragEnd();
    };
    
    const isOverdue = new Date(order.due_date) < new Date() && order.status !== 'finalizado';

    return (
        <Card 
            draggable
            onDragStart={handleInternalDragStart}
            onDragEnd={handleInternalDragEnd}
            onClick={onClick}
            className="p-3 shadow-sm hover:shadow-md transition cursor-pointer active:cursor-grabbing"
        >
            <p className="text-xs text-textSecondary font-mono font-semibold">{order.po_number}</p>
            <h3 className="text-sm font-semibold mt-1">{order.product?.name}</h3>
            
            <div className="flex justify-between items-center text-xs text-textSecondary mt-2">
                <div className="flex items-center gap-1.5">
                    <Package size={14}/>
                    <span>Qtd: {order.quantity}</span>
                </div>
                <div className={cn("flex items-center gap-1.5", isOverdue && "text-red-600 font-semibold")}>
                    <Calendar size={14} />
                    <span>{new Date(order.due_date).toLocaleDateString('pt-BR')}</span>
                </div>
            </div>
            
            <div className="mt-2 border-t pt-2">
                <Badge variant="secondary" className="capitalize">{order.priority}</Badge>
            </div>
        </Card>
    );
};

export default ProductionOrderCard;
