import React from 'react';
import { Order, OrderStatus } from '../types';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { cn } from '../lib/utils';
import { CreditCard, FileText, Truck } from 'lucide-react';

interface OrderCardProps {
  order: Order;
  onClick: () => void;
  className?: string;
}

const statusStyles: Record<OrderStatus, { badge: string; text: string; label: string }> = {
  pending_payment: { badge: 'bg-yellow-100 text-yellow-800', text: 'text-yellow-600', label: 'Aguard. Pagamento' },
  paid: { badge: 'bg-green-100 text-green-800', text: 'text-green-600', label: 'Pago' },
  in_production: { badge: 'bg-blue-100 text-blue-800', text: 'text-blue-600', label: 'Em Produção' },
  awaiting_shipping: { badge: 'bg-purple-100 text-purple-800', text: 'text-purple-600', label: 'Pronto p/ Envio' },
  shipped: { badge: 'bg-indigo-100 text-indigo-800', text: 'text-indigo-600', label: 'Enviado' },
  delivered: { badge: 'bg-emerald-100 text-emerald-800', text: 'text-emerald-600', label: 'Entregue' },
  cancelled: { badge: 'bg-red-100 text-red-800', text: 'text-red-600', label: 'Cancelado' },
};

const OrderCard: React.FC<OrderCardProps> = ({ order, onClick, className }) => {
    const style = statusStyles[order.status];
    const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

    const formatDate = (dateValue: any) => {
        if (!dateValue) return '';
        const date = dateValue.toDate ? dateValue.toDate() : new Date(dateValue);
        if (isNaN(date.getTime())) return '';
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    }

    return (
        <Card className={cn('hover:shadow-md transition-shadow cursor-pointer', className)} onClick={onClick}>
            <div className="p-4">
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <h3 className="font-bold text-textPrimary">{order.number}</h3>
                        <p className="text-sm text-textSecondary">{order.customers?.name}</p>
                    </div>
                    <div className={cn("text-xs font-bold px-2 py-1 rounded-full", style.badge)}>
                        {style.label}
                    </div>
                </div>
                
                <div className="text-sm text-textSecondary space-y-2 mb-3">
                    <p>{totalItems} item{totalItems > 1 ? 's' : ''} • <span className="font-medium text-textPrimary">R$ {order.total.toFixed(2)}</span></p>
                    <p>Criado em: {formatDate(order.created_at)}</p>
                </div>

                <div className="flex items-center justify-between text-xs text-textSecondary border-t border-border pt-3">
                    <span>Integrações:</span>
                    <div className="flex items-center gap-3">
                        <span title={`Pagamento: ${order.payments?.status}`}>
                            <CreditCard size={16} className={cn(order.payments?.status === 'paid' ? 'text-green-500' : 'text-gray-300')} />
                        </span>
                        <span title={`NFe: ${order.fiscal?.status || 'pendente'}`}>
                            <FileText size={16} className={cn(order.fiscal?.status === 'authorized' ? 'text-blue-500' : 'text-gray-300')} />
                        </span>
                        <span title={`Frete: ${order.logistics?.status || 'pendente'}`}>
                            <Truck size={16} className={cn(order.logistics?.status === 'shipped' || order.logistics?.status === 'delivered' ? 'text-indigo-500' : 'text-gray-300')} />
                        </span>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default OrderCard;