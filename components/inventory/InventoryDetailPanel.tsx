
import React from 'react';
import { InventoryBalance, InventoryMovement, InventoryMovementReason, InventoryMovementType } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { ArrowDownLeft, ArrowUpRight, History, Package, Edit, Loader2 } from 'lucide-react';
import { Badge } from '../ui/Badge';

interface InventoryDetailPanelProps {
    balance: InventoryBalance;
    movements: InventoryMovement[];
    isLoading: boolean;
}

const movementTypeConfig: Record<InventoryMovementType, { icon: React.ElementType, color: string }> = {
    'in': { icon: ArrowDownLeft, color: 'text-green-600' },
    'out': { icon: ArrowUpRight, color: 'text-red-600' },
    'adjustment': { icon: Edit, color: 'text-yellow-600' },
};

const movementReasonLabels: Record<InventoryMovementReason, string> = {
    'compra': 'Compra',
    'consumo_producao': 'Consumo (Produção)',
    'venda': 'Venda',
    'contagem': 'Contagem/Ajuste',
    'devolucao': 'Devolução',
    'perda': 'Perda',
};

const StatCard: React.FC<{ title: string, value: string, unit: string }> = ({ title, value, unit }) => (
    <div className="bg-secondary p-3 rounded-lg text-center">
        <p className="text-xs text-textSecondary">{title}</p>
        <p className="text-xl font-bold text-textPrimary">{value} <span className="text-sm font-normal">{unit}</span></p>
    </div>
);

const InventoryDetailPanel: React.FC<InventoryDetailPanelProps> = ({ balance, movements, isLoading }) => {
    const available = balance.quantity_on_hand - balance.quantity_reserved;
    const material = balance.material;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('pt-BR', {
            day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <Card className="sticky top-20 h-[calc(100vh-10rem)] overflow-y-auto">
            <CardHeader>
                <CardTitle className="flex items-start gap-3">
                    <Package size={24} className="text-primary mt-1" />
                    <div>
                        {material?.name}
                        <span className="block text-sm font-normal text-textSecondary font-mono">{material?.codigo}</span>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-3 gap-3 mb-6">
                    <StatCard title="Disponível" value={available.toFixed(2)} unit={material?.unit || ''} />
                    <StatCard title="Físico" value={balance.quantity_on_hand.toFixed(2)} unit={material?.unit || ''} />
                    <StatCard title="Reservado" value={balance.quantity_reserved.toFixed(2)} unit={material?.unit || ''} />
                </div>

                <div className="flex items-center gap-3 mb-4">
                     <History size={16} className="text-textSecondary" />
                     <h4 className="font-semibold text-textPrimary">Histórico de Movimentações</h4>
                </div>

                {isLoading ? (
                    <div className="text-center py-10">
                         <Loader2 className="mx-auto h-8 w-8 text-primary animate-spin" />
                         <p className="mt-2 text-sm text-textSecondary">Carregando histórico...</p>
                    </div>
                ) : movements.length === 0 ? (
                    <div className="text-center text-sm text-textSecondary p-6 bg-secondary rounded-lg">
                        Nenhuma movimentação registrada para este item.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {movements.map(move => {
                            const config = movementTypeConfig[move.type];
                            const Icon = config.icon;
                            const isPositive = move.quantity > 0;

                            return (
                                <div key={move.id} className="flex items-start gap-3 p-3 bg-secondary/50 rounded-lg">
                                    <div className={`p-1.5 rounded-full bg-background ${config.color}`}>
                                        <Icon size={16} />
                                    </div>
                                    <div className="flex-1 text-sm">
                                        <div className="flex justify-between">
                                            <p className="font-medium text-textPrimary">{movementReasonLabels[move.reason]}</p>
                                            <p className={`font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                                {isPositive ? '+' : ''}{move.quantity.toFixed(2)}
                                            </p>
                                        </div>
                                        <p className="text-xs text-textSecondary">
                                            {formatDate(move.created_at)}
                                            {move.reference_id && ` • Ref: ${move.reference_id}`}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default InventoryDetailPanel;
