
import React from 'react';
import { InventoryBalance } from '../../types';
import { Card, CardContent } from '../ui/Card';
import { Search, PackageOpen } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Badge } from '../ui/Badge';

interface InventoryBalanceListProps {
    balances: InventoryBalance[];
    isLoading: boolean;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    selectedMaterialId: string | null;
    onSelectMaterial: (id: string) => void;
}

const SkeletonRow: React.FC = () => (
    <tr className="animate-pulse">
        <td className="p-4"><div className="h-4 bg-gray-200 rounded w-3/4"></div></td>
        <td className="p-4"><div className="h-4 bg-gray-200 rounded w-1/2"></div></td>
        <td className="p-4"><div className="h-4 bg-gray-200 rounded w-1/4"></div></td>
        <td className="p-4"><div className="h-4 bg-gray-200 rounded w-1/4"></div></td>
        <td className="p-4"><div className="h-6 bg-gray-200 rounded-full w-20"></div></td>
    </tr>
);

const InventoryBalanceList: React.FC<InventoryBalanceListProps> = ({
    balances, isLoading, searchQuery, onSearchChange, selectedMaterialId, onSelectMaterial
}) => {
    
    const getStockStatus = (balance: InventoryBalance) => {
        const available = balance.quantity_on_hand - balance.quantity_reserved;
        if (available <= 0) return { label: 'Sem Estoque', variant: 'inativo' as const };
        if (available <= balance.low_stock_threshold) return { label: 'Estoque Baixo', variant: 'secondary' as const };
        return { label: 'Em Estoque', variant: 'ativo' as const };
    };

    return (
        <Card>
            <CardContent className="p-0">
                <div className="p-4 border-b border-border">
                    <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <Search className="h-4 w-4 text-textSecondary" />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            placeholder="Buscar por nome ou código..."
                            className="w-full pl-9 pr-3 py-2 border border-border rounded-xl shadow-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                    </div>
                </div>

                {isLoading ? (
                    <table className="w-full">
                        <tbody>
                            {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
                        </tbody>
                    </table>
                ) : balances.length === 0 ? (
                    <div className="text-center text-textSecondary py-16">
                        <PackageOpen className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-4 text-lg font-medium text-textPrimary">Nenhum material encontrado</h3>
                        <p className="mt-1 text-sm">Nenhum material corresponde à sua busca.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-secondary">
                                <tr>
                                    <th className="p-4 font-semibold text-textSecondary">Material</th>
                                    <th className="p-4 font-semibold text-textSecondary">Disponível</th>
                                    <th className="p-4 font-semibold text-textSecondary">Físico</th>
                                    <th className="p-4 font-semibold text-textSecondary">Reservado</th>
                                    <th className="p-4 font-semibold text-textSecondary">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {balances.map(balance => {
                                    const status = getStockStatus(balance);
                                    const available = balance.quantity_on_hand - balance.quantity_reserved;
                                    return (
                                        <tr
                                            key={balance.material_id}
                                            onClick={() => onSelectMaterial(balance.material_id)}
                                            className={cn(
                                                'border-b border-border cursor-pointer transition-colors',
                                                selectedMaterialId === balance.material_id ? 'bg-accent' : 'hover:bg-accent/50'
                                            )}
                                        >
                                            <td className="p-4 font-medium text-textPrimary">
                                                {balance.material?.name}
                                                <span className="block text-xs text-textSecondary font-mono">{balance.material?.codigo}</span>
                                            </td>
                                            <td className="p-4 font-bold text-lg text-primary">{available.toFixed(2)} <span className="text-xs font-normal text-textSecondary">{balance.material?.unit}</span></td>
                                            <td className="p-4">{balance.quantity_on_hand.toFixed(2)}</td>
                                            <td className="p-4">{balance.quantity_reserved.toFixed(2)}</td>
                                            <td className="p-4"><Badge variant={status.variant}>{status.label}</Badge></td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default InventoryBalanceList;
