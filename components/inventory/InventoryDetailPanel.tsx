import React from 'react';
import { InventoryBalance, InventoryMovement, InventoryMovementReason, InventoryMovementType } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { ArrowDownLeft, ArrowUpRight, History, Package, Edit, RotateCw } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import EmptyState from './EmptyState';

interface InventoryDetailPanelProps {
    balance: InventoryBalance;
    movements: InventoryMovement[];
    isLoading: boolean;
}

const movementTypeConfig: Record<InventoryMovementType, { icon: React.ElementType, color: string }> = {
    'in': { icon: ArrowDownLeft, color: 'text-green-600' },
    'out': { icon: ArrowUpRight, color: 'text-red-600' },
    'adjust': { icon: Edit, color: 'text-yellow-600' },
    'transfer': { icon: RotateCw, color: 'text-blue-600' },
};

const movementReasonLabels: Record<InventoryMovementReason, string> = {
    'RECEBIMENTO_PO': 'Recebimento de Compra',
    'CONSUMO_PRODUCAO': 'Consumo (Produção)',
    'VENDA_DIRETA': 'Venda Direta',
    'AJUSTE_CONTAGEM': 'Ajuste de Contagem',
    'DEVOLUCAO_CLIENTE': 'Devolução de Cliente',
    'PERDA_AVARIA': 'Perda/Avaria',
    'TRANSFERENCIA_INTERNA': 'Transferência Interna'
};

const StatCard: React.FC<{ title: string, value: string, unit: string }> = ({ title, value, unit }) => (
    <div className="bg-secondary p-3 rounded-lg text-center">
        <p className="text-xs text-textSecondary">{title}</p>
        <p className="text-xl font-bold text-textPrimary">{value} <span className="text-sm font-normal">{unit}</span></p>
    </div>
);

const InventoryDetailPanel: React.FC<InventoryDetailPanelProps> = ({ balance, movements, isLoading }) => {
    const available = balance.current_stock - balance.reserved_stock;
    const material = balance.material;

    const formatDate = (dateValue: any) => {
        if (!dateValue) return '-';
        const date = dateValue.toDate ? dateValue.toDate() : new Date(dateValue);
        if (isNaN(date.getTime())) return '-';
        return date.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <Card className="sticky top-20 h-[calc(100vh-10rem)] overflow-y-auto">
            <CardHeader>
                <CardTitle>{material?.name}</CardTitle>
                <p className="text-sm text-textSecondary font-mono">{material?.codigo}</p>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-3 gap-2 mb-6">
                    <StatCard title="Disponível" value={available.toFixed(2)} unit={material?.unit || ''} />
                    <StatCard title="Físico" value={balance.current_stock.toFixed(2)} unit={material?.unit || ''} />
                    <StatCard title="Reservado" value={balance.reserved_stock.toFixed(2)} unit={material?.unit || ''} />
                </div>

                <div className="border-t pt-4">
                    <h4 className="font-semibold text-md mb-2 flex items-center gap-2"><History size={16}/> Histórico de Movimentos</h4>
                     {isLoading ? (
                        <div className="flex justify-center items-center h-48">
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        </div>
                    ) : movements.length === 0 ? (
                        <div className="p-6">
                           <EmptyState 
                                title="Sem Movimentos"
                                message="Nenhum movimento de estoque foi registrado para este material."
                                icon={History}
                           />
                        </div>
                    ) : (
                        <ul className="space-y-3">
                            {movements.map(move => {
                                const config = movementTypeConfig[move.type];
                                const Icon = config.icon;
                                const isPositive = move.type === 'in' || (move.type === 'adjust' && move.quantity > 0);
                                return (
                                    <li key={move.id} className="flex items-center gap-3">
                                        <div className={`p-2 rounded-full bg-secondary ${config.color}`}>
                                            <Icon size={18} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-sm">{movementReasonLabels[move.reason]}</p>
                                            <p className="text-xs text-textSecondary">{formatDate(move.created_at)} {move.ref && `(${move.ref})`}</p>
                                        </div>
                                        <p className={`font-semibold text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                            {isPositive ? '+' : ''}{move.quantity.toFixed(2)}
                                        </p>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default InventoryDetailPanel;
