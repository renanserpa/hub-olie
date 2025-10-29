import React from 'react';
import { PurchaseOrder } from '../../types';
import { Card } from '../ui/Card';
import { cn } from '../../lib/utils';
import { Badge } from '../ui/Badge';

interface POListProps {
    purchaseOrders: (PurchaseOrder & { supplier?: any })[];
    selectedPOId: string | null;
    onSelectPO: (id: string) => void;
}

const statusConfig: Record<PurchaseOrder['status'], { label: string; color: string }> = {
    draft: { label: 'Rascunho', color: 'bg-gray-100 text-gray-800' },
    issued: { label: 'Emitido', color: 'bg-blue-100 text-blue-800' },
    partial: { label: 'Parcial', color: 'bg-yellow-100 text-yellow-800' },
    received: { label: 'Recebido', color: 'bg-green-100 text-green-800' },
    canceled: { label: 'Cancelado', color: 'bg-red-100 text-red-800' },
};

const POCard: React.FC<{ po: PurchaseOrder & { supplier?: any }, isSelected: boolean, onClick: () => void }> = ({ po, isSelected, onClick }) => {
    const status = statusConfig[po.status];
    return (
        <Card
            onClick={onClick}
            className={cn(
                'cursor-pointer transition-all duration-200 hover:shadow-md p-4',
                isSelected ? 'ring-2 ring-primary shadow-lg' : 'hover:border-primary/50'
            )}
        >
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-bold text-textPrimary font-mono">{po.po_number}</h3>
                    <p className="text-sm text-textSecondary">{po.supplier?.name}</p>
                </div>
                <Badge className={cn('text-xs', status.color)}>{status.label}</Badge>
            </div>
            <div className="flex justify-between items-end mt-2 text-sm">
                <span className="text-textSecondary">{new Date(po.created_at).toLocaleDateString('pt-BR')}</span>
                <span className="font-bold text-textPrimary">R$ {po.total.toFixed(2)}</span>
            </div>
        </Card>
    );
};

const POList: React.FC<POListProps> = ({ purchaseOrders, selectedPOId, onSelectPO }) => {
    return (
        <div className="space-y-3">
            {purchaseOrders.map(po => (
                <POCard
                    key={po.id}
                    po={po}
                    isSelected={po.id === selectedPOId}
                    onClick={() => onSelectPO(po.id)}
                />
            ))}
        </div>
    );
};

export default POList;