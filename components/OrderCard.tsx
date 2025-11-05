import React from 'react';
import { Order, OrderStatus } from '../types';
import { Card } from './ui/Card';
import { cn } from '../lib/utils';
import { CreditCard, FileText, Truck, Clock, Cog, PackageCheck, CheckCircle, XCircle, Package, CircleDollarSign } from 'lucide-react';

interface OrderCardProps {
  order: Order;
  onClick: () => void;
  className?: string;
}

const statusConfig: Record<OrderStatus, { label: string; icon: React.ElementType; color: string; bgColor: string; }> = {
  pending_payment: { label: 'Aguard. Pag.', icon: Clock, color: 'text-yellow-800 dark:text-yellow-200', bgColor: 'bg-yellow-100 dark:bg-yellow-900/30' },
  paid: { label: 'Pago', icon: CreditCard, color: 'text-green-800 dark:text-green-200', bgColor: 'bg-green-100 dark:bg-green-900/30' },
  in_production: { label: 'Em Produção', icon: Cog, color: 'text-blue-800 dark:text-blue-200', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
  awaiting_shipping: { label: 'Pronto p/ Envio', icon: PackageCheck, color: 'text-purple-800 dark:text-purple-200', bgColor: 'bg-purple-100 dark:bg-purple-900/30' },
  shipped: { label: 'Enviado', icon: Truck, color: 'text-indigo-800 dark:text-indigo-200', bgColor: 'bg-indigo-100 dark:bg-indigo-900/30' },
  delivered: { label: 'Entregue', icon: CheckCircle, color: 'text-emerald-800 dark:text-emerald-200', bgColor: 'bg-emerald-100 dark:bg-emerald-900/30' },
  cancelled: { label: 'Cancelado', icon: XCircle, color: 'text-red-800 dark:text-red-200', bgColor: 'bg-red-100 dark:bg-red-900/30' },
};

const OrderCard: React.FC<OrderCardProps> = ({ order, onClick, className }) => {
    const config = statusConfig[order.status];
    const StatusIcon = config.icon;
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
        <Card 
            className={cn('hover:shadow-lg transition-all duration-200 cursor-pointer hover:-translate-y-0.5', className)} 
            onClick={onClick}
        >
            <div className="p-4">
                <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-textPrimary dark:text-dark-textPrimary pr-2">{order.number}</h3>
                    <div className={cn("text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1.5", config.bgColor, config.color)}>
                        <StatusIcon size={14} />
                        <span>{config.label}</span>
                    </div>
                </div>
                
                <p className="text-sm text-textSecondary dark:text-dark-textSecondary mb-4">{order.customers?.name}</p>

                <div className="text-sm text-textSecondary dark:text-dark-textSecondary space-y-2 mb-4">
                    <div className="flex items-center gap-2">
                        <Package size={14} />
                        <span>{totalItems} item{totalItems > 1 ? 's' : ''}</span>
                    </div>
                     <div className="flex items-center gap-2">
                        <CircleDollarSign size={14} />
                        <span className="font-medium text-textPrimary dark:text-dark-textPrimary">R$ {order.total.toFixed(2)}</span>
                    </div>
                </div>

                <div className="flex items-center justify-between text-xs text-textSecondary dark:text-dark-textSecondary border-t border-border dark:border-dark-border pt-3">
                    <span>Criado em: {formatDate(order.created_at)}</span>
                    <div className="flex items-center gap-3">
                        <span title={`Pagamento: ${order.payments?.status || 'pendente'}`}>
                            <CreditCard size={16} className={cn(order.payments?.status === 'paid' ? 'text-green-500' : 'text-gray-300 dark:text-gray-600')} />
                        </span>
                        <span title={`NFe: ${order.fiscal?.status || 'pendente'}`}>
                            <FileText size={16} className={cn(order.fiscal?.status === 'authorized' ? 'text-blue-500' : 'text-gray-300 dark:text-gray-600')} />
                        </span>
                        <span title={`Frete: ${order.logistics?.status === 'shipped' || order.logistics?.status === 'delivered' ? 'text-indigo-500' : 'text-gray-300 dark:text-gray-600'}`}>
                            <Truck size={16} />
                        </span>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default OrderCard;
