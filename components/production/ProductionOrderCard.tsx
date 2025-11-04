import React from 'react';
import { ProductionOrder, ProductionOrderStatus } from '../../types';
import { Card } from '../ui/Card';
import { cn } from '../../lib/utils';
import { Calendar, Package, AlertCircle } from 'lucide-react';

interface ProductionOrderCardProps {
    order: ProductionOrder;
    onClick: () => void;
    className?: string;
}

const statusStyles: Record<ProductionOrderStatus, { badge: string; label: string }> = {
  novo: { badge: 'bg-gray-100 text-gray-800', label: 'Nova' },
  planejado: { badge: 'bg-blue-100 text-blue-800', label: 'Planejada' },
  em_andamento: { badge: 'bg-indigo-100 text-indigo-800', label: 'Em Andamento' },
  em_espera: { badge: 'bg-yellow-100 text-yellow-800', label: 'Em Espera' },
  finalizado: { badge: 'bg-green-100 text-green-800', label: 'Finalizada' },
  cancelado: { badge: 'bg-red-100 text-red-800', label: 'Cancelada' },
};

const ProductionOrderCard: React.FC<ProductionOrderCardProps> = ({ order, onClick, className }) => {
    const style = statusStyles[order.status];
    const isOverdue = new Date(order.due_date) < new Date() && order.status !== 'finalizado' && order.status !== 'cancelado';

    const formatDate = (dateValue: any) => {
        if (!dateValue) return '';
        const date = new Date(dateValue);
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    }

    return (
        <Card className={cn('hover:shadow-md transition-shadow cursor-pointer', className)} onClick={onClick}>
            <div className="p-4">
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <h3 className="font-bold text-textPrimary font-mono">{order.po_number}</h3>
                        <p className="text-sm text-textSecondary">{order.product?.name}</p>
                    </div>
                    <div className={cn("text-xs font-bold px-2 py-1 rounded-full", style.badge)}>
                        {style.label}
                    </div>
                </div>
                
                <div className="flex items-center justify-between text-sm text-textSecondary space-y-2">
                    <div className="flex items-center gap-1.5">
                        <Package size={14} />
                        <span>{order.quantity} unid.</span>
                    </div>
                    <div className={cn("flex items-center gap-1.5", isOverdue && 'text-red-600 font-semibold')}>
                        {isOverdue && <AlertCircle size={14} />}
                        <Calendar size={14} />
                        <span>{formatDate(order.due_date)}</span>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default ProductionOrderCard;