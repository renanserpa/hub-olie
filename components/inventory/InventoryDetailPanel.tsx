import React from 'react';
import { InventoryBalance, InventoryMovement, Material, InventoryMovementReason, InventoryMovementType } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { ArrowDownLeft, ArrowUpRight, History, Edit, RotateCw, Warehouse, FileText } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import EmptyState from './EmptyState';
import InventoryChart from './InventoryChart';

interface InventoryDetailPanelProps {
    material: Material;
    balances: InventoryBalance[];
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
    'TRANSFERENCIA_INTERNA': 'Transferência Interna',
    // FIX: Add missing 'ENTRADA_PRODUCAO' reason label.
    'ENTRADA_PRODUCAO': 'Entrada (Produção)'
};

const InventoryDetailPanel: React.FC<InventoryDetailPanelProps> = ({ material, balances, movements, isLoading }) => {
    
    const formatDate = (dateValue: any) => {
        if (!dateValue) return '-';
        const date = dateValue.toDate ? dateValue.toDate() : new Date(dateValue);
        if (isNaN(date.getTime())) return '-';
        return date.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <Card className="sticky top-20 h-[calc(100vh-18rem)] overflow-y-auto">
            <CardHeader>
                <CardTitle>{material.name}</CardTitle>
                <p className="text-sm text-textSecondary font-mono">{material.sku}</p>
            </CardHeader>
            <CardContent>
                 <div className="mb-6">
                    <h4 className="font-semibold text-md mb-2 flex items-center gap-2"><FileText size={16}/> Detalhes do Material</h4>
                    <div className="p-3 bg-secondary dark:bg-dark-secondary rounded-lg text-sm space-y-1 text-textSecondary dark:text-dark-textSecondary">
                        <p><strong>Fornecedor:</strong> {material.supplier?.name || 'Não especificado'}</p>
                        <p><strong>Composição:</strong> {material.technical_specs?.composition || 'N/A'}</p>
                        <p><strong>Gramatura:</strong> {material.technical_specs?.weight_gsm ? `${material.technical_specs.weight_gsm} g/m²` : 'N/A'}</p>
                        <p><strong>Cuidados:</strong> {material.care_instructions || 'N/A'}</p>
                    </div>
                </div>

                <div className="mb-6">
                    <h4 className="font-semibold text-md mb-2 flex items-center gap-2"><Warehouse size={16}/> Saldo por Armazém</h4>
                    {balances.length > 0 ? (
                        <div className="grid grid-cols-1 gap-2">
                            {balances.map(b => (
                                <div key={b.id} className="bg-secondary dark:bg-dark-secondary p-3 rounded-lg grid grid-cols-3 gap-2 text-center">
                                    <p className="col-span-3 text-left font-medium text-sm">{b.warehouse?.name}</p>
                                    <div><p className="text-xs text-textSecondary dark:text-dark-textSecondary">Disponível</p><p className="font-bold text-primary">{(b.current_stock - b.reserved_stock).toFixed(2)}</p></div>
                                    <div><p className="text-xs text-textSecondary dark:text-dark-textSecondary">Físico</p><p className="font-semibold">{(b.current_stock).toFixed(2)}</p></div>
                                    <div><p className="text-xs text-textSecondary dark:text-dark-textSecondary">Reservado</p><p className="font-semibold">{(b.reserved_stock).toFixed(2)}</p></div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-center text-textSecondary dark:text-dark-textSecondary py-4">Sem saldo registrado.</p>
                    )}
                </div>

                <InventoryChart movements={movements} material={material} />

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
                                        <div className={`p-2 rounded-full bg-secondary dark:bg-dark-secondary ${config.color}`}>
                                            <Icon size={18} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-sm">{movementReasonLabels[move.reason]}</p>
                                            <p className="text-xs text-textSecondary dark:text-dark-textSecondary">{formatDate(move.created_at)} {move.ref && `(${move.ref})`}</p>
                                        </div>
                                        <p className={`font-semibold text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                            {isPositive && move.type !== 'transfer' ? '+' : ''}{move.quantity.toFixed(2)}
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
