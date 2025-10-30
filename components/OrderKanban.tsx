
import React, { useState } from 'react';
import { Order, OrderStatus } from '../types';
import OrderCard from './OrderCard';
import { cn } from '../lib/utils';

const ORDER_COLUMNS: { id: OrderStatus, label: string, color: string }[] = [
  { id: 'pending_payment', label: 'Aguardando Pagamento', color: 'bg-yellow-100' },
  { id: 'paid', label: 'Pago', color: 'bg-green-100' },
  { id: 'in_production', label: 'Em Produção', color: 'bg-blue-100' },
  { id: 'awaiting_shipping', label: 'Pronto p/ Envio', color: 'bg-purple-100' },
  { id: 'shipped', label: 'Enviado', color: 'bg-indigo-100' },
  { id: 'delivered', label: 'Entregue', color: 'bg-emerald-100' },
  { id: 'cancelled', label: 'Cancelado', color: 'bg-red-100' }
];

interface OrderKanbanProps {
  orders: Order[];
  onStatusChange: (orderId: string, newStatus: OrderStatus) => void;
  onCardClick: (orderId: string) => void;
}

const OrderKanban: React.FC<OrderKanbanProps> = ({ orders, onStatusChange, onCardClick }) => {
    const [draggedOrderId, setDraggedOrderId] = useState<string | null>(null);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, orderId: string) => {
        setDraggedOrderId(orderId);
        e.dataTransfer.setData('orderId', orderId);
        e.currentTarget.style.opacity = '0.5';
    };

    const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
        setDraggedOrderId(null);
        e.currentTarget.style.opacity = '1';
    };
    
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };
    
    const handleDrop = (e: React.DragEvent<HTMLDivElement>, newStatus: OrderStatus) => {
        e.preventDefault();
        const orderId = e.dataTransfer.getData('orderId');
        if (orderId) {
            onStatusChange(orderId, newStatus);
        }
    };

    return (
        <div className="flex gap-4 overflow-x-auto pb-4">
            {ORDER_COLUMNS.map(column => (
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
                                    <OrderCard order={order} onClick={() => onCardClick(order.id)} />
                                </div>
                            ))
                        }
                    </div>
                </div>
            ))}
        </div>
    );
};

export default OrderKanban;