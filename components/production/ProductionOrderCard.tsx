


import React from 'react';
import { ProductionOrder, ProductionOrderStatus } from '../../types';
import { Card } from '../ui/Card';
import { cn } from '../../lib/utils';
import {
    Clock, Flame, AlertCircle, CheckCircle, XCircle, PauseCircle, Cog, Calendar as CalendarIcon, Package,
} from 'lucide-react';

interface ProductionOrderCardProps {
    order: ProductionOrder;
    isSelected: boolean;
    onClick: () => void;
}

type StatusInfo = {
    label: string;
    icon: React.ElementType;
    color: string;
    bgColor: string;
};

const STATUS_CONFIG: Record<ProductionOrderStatus, StatusInfo> = {
    novo: { label: 'Nova', icon: Package, color: 'text-gray-600', bgColor: 'bg-gray-100' },
    planejado: { label: 'Planejada', icon: CalendarIcon, color: 'text-blue-600', bgColor: 'bg-blue-100' },
    em_andamento: { label: 'Em Andamento', icon: Cog, color: 'text-indigo-600', bgColor: 'bg-indigo-100' },
    em_espera: { label: 'Em Espera', icon: PauseCircle, color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
    finalizado: { label: 'Finalizada', icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-100' },
    cancelado: { label: 'Cancelada', icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-100' },
};

const PRIORITY_ICONS = {
    baixa: null,
    normal: null,
    alta: <span title="Prioridade Alta"><Flame size={14} className="text-orange-500" /></span>,
    urgente: <span title="Prioridade Urgente"><Flame size={14} className="text-red-600" /></span>,
};

const ProductionOrderCard: React.FC<ProductionOrderCardProps> = ({ order, isSelected, onClick }) => {
    const statusInfo = STATUS_CONFIG[order.status];
    const progress = order.steps_total > 0 ? (order.steps_completed / order.steps_total) * 100 : 0;
    const isOverdue = new Date(order.due_date) < new Date() && order.status !== 'finalizado' && order.status !== 'cancelado';

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    return (
        <Card
            onClick={onClick}
            className={cn(
                'cursor-pointer transition-all duration-200 hover:shadow-md',
                isSelected ? 'ring-2 ring-primary shadow-lg' : 'hover:border-primary/50'
            )}
        >
            <div className="p-4">
                <div className="flex justify-between items-start gap-2">
                    <h3 className="font-bold text-textPrimary font-mono">{order.po_number}</h3>
                    <div className={cn("flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded-full", statusInfo.bgColor, statusInfo.color)}>
                        <statusInfo.icon size={12} />
                        <span>{statusInfo.label}</span>
                    </div>
                </div>
                <p className="text-sm text-textSecondary mt-1">{order.product?.name}</p>

                <div className="flex justify-between items-center text-sm text-textSecondary mt-3">
                    <span>Qtd: <span className="font-bold text-textPrimary">{order.quantity}</span></span>
                    <div className="flex items-center gap-2">
                        {PRIORITY_ICONS[order.priority]}
                        {isOverdue && <span title="Atrasado"><AlertCircle size={14} className="text-red-500" /></span>}
                        <div className="flex items-center gap-1.5">
                            <Clock size={12} />
                            <span>{formatDate(order.due_date)}</span>
                        </div>
                    </div>
                </div>

                <div className="mt-3">
                     <div className="flex justify-between text-xs text-textSecondary mb-1">
                        <span>Progresso</span>
                        <span>{order.steps_completed}/{order.steps_total}</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-1.5">
                        <div
                            className={cn("h-1.5 rounded-full", statusInfo.bgColor.replace('100', '400'))}
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default ProductionOrderCard;