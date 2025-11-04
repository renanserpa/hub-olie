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
  novo: { badge: 'bg-gray-100 text-gray-800', label: 'Nova' },
  planejado: { badge: 'bg-blue-100 text-blue-800', label: 'Planejada' },
  em_andamento: { badge: 'bg-indigo-100 text-indigo-800', label: 'Em Andamento' },
  em_espera: { badge: 'bg-yellow-100 text-yellow-800', label: 'Em Espera' },
  finalizado: { badge: 'bg-green-100 text-green-800', label: 'Finalizada' },
  cancelado: { badge: 'bg-red-100 text-red-800', label: 'Cancelada' },
};


const ProductionTable: React.FC<ProductionTableProps> = ({ orders, onOrderSelect }) => {
    
    const formatDate = (dateValue: any) => {
        if (!dateValue) return '';
        const date = new Date(dateValue);
        return date.toLocaleDateString('pt-BR');
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
                            {orders.map(order => {
                                const status = statusStyles[order.status];
                                return (
                                    <tr key={order.id} className="border-b border-border hover:bg-accent/50 cursor-pointer" onClick={() => onOrderSelect(order.id)}>
                                        <td className="p-4 font-medium text-textPrimary font-mono">{order.po_number}</td>
                                        <td className="p-4 text-textSecondary">{order.product?.name || 'N/A'}</td>
                                        <td className="p-4 text-textSecondary">{order.quantity}</td>
                                        <td className="p-4 text-textSecondary">{formatDate(order.due_date)}</td>
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

export default ProductionTable;