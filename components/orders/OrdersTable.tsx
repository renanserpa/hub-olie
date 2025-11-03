import React from 'react';
import { Order, OrderStatus } from '../../types';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Edit } from 'lucide-react';
import { cn } from '../../lib/utils';

interface OrdersTableProps {
    orders: Order[];
    onOrderSelect: (orderId: string) => void;
}

// Re-using the same style logic from OrderCard for consistency
const statusStyles: Record<OrderStatus, { badge: string; text: string; label: string }> = {
  pending_payment: { badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200', text: 'text-yellow-600', label: 'Aguard. Pagamento' },
  paid: { badge: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200', text: 'text-green-600', label: 'Pago' },
  in_production: { badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200', text: 'text-blue-600', label: 'Em Produção' },
  awaiting_shipping: { badge: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200', text: 'text-purple-600', label: 'Pronto p/ Envio' },
  shipped: { badge: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200', text: 'text-indigo-600', label: 'Enviado' },
  delivered: { badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200', text: 'text-emerald-600', label: 'Entregue' },
  cancelled: { badge: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200', text: 'text-red-600', label: 'Cancelado' },
};

const OrdersTable: React.FC<OrdersTableProps> = ({ orders, onOrderSelect }) => {
    
    const formatDate = (dateValue: any) => {
        if (!dateValue) return '';
        const date = dateValue.toDate ? dateValue.toDate() : new Date(dateValue);
        if (isNaN(date.getTime())) return '';
        return date.toLocaleDateString('pt-BR');
    }

    return (
        <Card>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-secondary dark:bg-dark-secondary">
                            <tr>
                                <th className="p-4 font-semibold text-textSecondary dark:text-dark-textSecondary">Pedido</th>
                                <th className="p-4 font-semibold text-textSecondary dark:text-dark-textSecondary">Cliente</th>
                                <th className="p-4 font-semibold text-textSecondary dark:text-dark-textSecondary">Data</th>
                                <th className="p-4 font-semibold text-textSecondary dark:text-dark-textSecondary text-right">Total</th>
                                <th className="p-4 font-semibold text-textSecondary dark:text-dark-textSecondary">Status</th>
                                <th className="p-4 font-semibold text-textSecondary dark:text-dark-textSecondary text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => {
                                const status = statusStyles[order.status];
                                return (
                                    <tr key={order.id} className="border-b border-border dark:border-dark-border hover:bg-accent/50 dark:hover:bg-dark-accent/50 cursor-pointer" onClick={() => onOrderSelect(order.id)}>
                                        <td className="p-4 font-medium text-textPrimary dark:text-dark-textPrimary font-mono">{order.number}</td>
                                        <td className="p-4 text-textSecondary dark:text-dark-textSecondary">{order.customers?.name || 'N/A'}</td>
                                        <td className="p-4 text-textSecondary dark:text-dark-textSecondary">{formatDate(order.created_at)}</td>
                                        <td className="p-4 text-textPrimary dark:text-dark-textPrimary font-semibold text-right">
                                            {order.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </td>
                                        <td className="p-4">
                                            <div className={cn('inline-flex items-center rounded-full border border-transparent px-2.5 py-0.5 text-xs font-semibold', status.badge)}>
                                                {status.label}
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onOrderSelect(order.id); }}>
                                                <Edit size={14} className="mr-2" />
                                                Detalhes
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
};

export default OrdersTable;