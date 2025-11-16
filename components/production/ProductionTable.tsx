import React from 'react';
import { ProductionOrder, ProductionOrderStatus } from '../../types';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Edit } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ProductionTableProps {
    orders: ProductionOrder[];
    onOrderSelect: (orderId: string) => void;
}

const statusStyles: Record<ProductionOrderStatus, { badge: string; label: string }> = {
    novo: { badge: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200', label: 'Nova' },
    planejado: { badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200', label: 'Planejada' },
    em_andamento: { badge: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200', label: 'Em Andamento' },
    em_espera: { badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200', label: 'Em Espera' },
    finalizado: { badge: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200', label: 'Finalizada' },
    cancelado: { badge: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200', label: 'Cancelada' },
};

const ProductionTable: React.FC<ProductionTableProps> = ({ orders, onOrderSelect }) => {
    const formatDate = (dateValue: string | undefined | null) => {
        if (!dateValue) return '';
        const date = new Date(dateValue);
        return date.toLocaleDateString('pt-BR');
    };

    if (!orders || orders.length === 0) {
        return (
            <Card>
                <CardContent>
                    <div className="p-4 text-center text-sm text-textSecondary">Nenhuma ordem de produção encontrada.</div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-secondary dark:bg-dark-secondary">
                            <tr>
                                <th className="p-4 font-semibold text-textSecondary">OP</th>
                                <th className="p-4 font-semibold text-textSecondary">Produto</th>
                                <th className="p-4 font-semibold text-textSecondary">Quantidade</th>
                                <th className="p-4 font-semibold text-textSecondary">Prazo</th>
                                <th className="p-4 font-semibold text-textSecondary">Status</th>
                                <th className="p-4 font-semibold text-textSecondary text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => {
                                const status = statusStyles[order.status];
                                return (
                                    <tr key={order.id} className="border-b border-border hover:bg-accent/50 cursor-pointer">
                                        <td className="p-4">{order.po_number ?? order.order_code ?? order.id}</td>
                                        <td className="p-4">{order.product_name ?? order.product?.name ?? '-'}</td>
                                        <td className="p-4">{order.quantity ?? 0}</td>
                                        <td className="p-4">{formatDate(order.due_date)}</td>
                                        <td className="p-4">
                                            <span className={cn('inline-flex items-center px-2 py-1 rounded text-xs font-medium', status?.badge ?? 'bg-gray-100')}>{status?.label ?? order.status}</span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <Button variant="ghost" size="sm" onClick={() => onOrderSelect(order.id)} aria-label={`Editar ordem ${order.po_number ?? order.id}`}>
                                                <Edit className="w-4 h-4" />
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

export default ProductionTable;