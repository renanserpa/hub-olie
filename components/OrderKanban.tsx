import React, { useState } from 'react';
import { Order, OrderStatus } from '../types';
import OrderCard from './OrderCard';
import { cn } from '../lib/utils';
import { Clock, CreditCard, Cog, PackageCheck, Truck, CheckCircle, XCircle } from 'lucide-react';


const ORDER_COLUMNS: { id: OrderStatus, label: string, icon: React.ElementType, borderColor: string }[] = [
  { id: 'pending_payment', label: 'Aguardando Pagamento', icon: Clock, borderColor: 'border-yellow-400' },
  { id: 'paid', label: 'Pago', icon: CreditCard, borderColor: 'border-green-400' },
  { id: 'in_production', label: 'Em Produção', icon: Cog, borderColor: 'border-blue-400' },
  { id: 'awaiting_shipping', label: 'Pronto p/ Envio', icon: PackageCheck, borderColor: 'border-purple-400' },
  { id: 'shipped', label: 'Enviado', icon: Truck, borderColor: 'border-indigo-400' },
  { id: 'delivered', label: 'Entregue', icon: CheckCircle, borderColor: 'border-emerald-400' },
  { id: 'cancelled', label: 'Cancelado', icon: XCircle, borderColor: 'border-red-400' }
];

interface OrderKanbanProps {
  orders: Order[];
  onStatusChange: (orderId: string, newStatus: OrderStatus) => void;
  onCardClick: (orderId: string) => void;
}

const OrderKanban: React.FC<OrderKanbanProps> = ({ orders, onStatusChange, onCardClick }) => {
    const [draggedOrderId, setDraggedOrderId] = useState<string | null>(null);
    const [isDraggingOver, setIsDraggingOver] = useState<OrderStatus | null>(null);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, orderId: string) => {
        setDraggedOrderId(orderId);
        e.dataTransfer.setData('orderId', orderId);
        e.currentTarget.style.opacity = '0.5';
    };

    const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
        setDraggedOrderId(null);
        e.currentTarget.style.opacity = '1';
    };
    
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>, status: OrderStatus) => {
        e.preventDefault();
        setIsDraggingOver(status);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDraggingOver(null);
    };
    
    const handleDrop = (e: React.DragEvent<HTMLDivElement>, newStatus: OrderStatus) => {
        e.preventDefault();
        setIsDraggingOver(null);
        const orderId = e.dataTransfer.getData('orderId');
        const order = orders.find(o => o.id === orderId);
        if (orderId && order && order.status !== newStatus) {
            onStatusChange(orderId, newStatus);
        }
    };

    return (
        <div className="flex gap-4 overflow-x-auto pb-4">
            {ORDER_COLUMNS.map(column => {
                const { icon: Icon, borderColor } = column;
                const columnOrders = orders.filter(o => o.status === column.id);
                return (
                    <div 
                        key={column.id}
                        onDragOver={(e) => handleDragOver(e, column.id)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, column.id)}
                        className={cn(
                            "w-80 flex-shrink-0 bg-secondary dark:bg-dark-secondary rounded-xl flex flex-col transition-colors duration-200",
                            isDraggingOver === column.id && "bg-primary/10"
                        )}
                    >
                        <div className={cn("p-3 border-t-4 rounded-t-lg", borderColor)}>
                            <div className="flex justify-between items-center">
                                <h3 className="font-semibold text-sm text-textPrimary dark:text-dark-textPrimary flex items-center gap-2">
                                    <Icon size={16} className="text-textSecondary" />
                                    {column.label}
                                </h3>
                                <span className="text-xs font-bold text-textSecondary dark:text-dark-textSecondary bg-background dark:bg-dark-background px-2.5 py-1 rounded-full">
                                    {columnOrders.length}
                                </span>
                            </div>
                        </div>
                        <div className="p-3 space-y-3 overflow-y-auto min-h-[200px] flex-grow">
                            {columnOrders
                                .map(order => (
                                    <div
                                        key={order.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, order.id)}
                                        onDragEnd={handleDragEnd}
                                    >
                                        <OrderCard order={order} onClick={() => onCardClick(order.id)} />
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default OrderKanban;
