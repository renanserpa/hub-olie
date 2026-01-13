import React from 'react';
import { Material } from '../../types';
import { Card, CardContent } from '../ui/Card';
import { Search } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Badge } from '../ui/Badge';
import EmptyState from './EmptyState';

interface AggregatedBalance {
    material: Material;
    current_stock: number;
    reserved_stock: number;
}

interface InventoryBalanceListProps {
    balances: AggregatedBalance[];
    isLoading: boolean;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    selectedMaterialId: string | null;
    onSelectMaterial: (id: string) => void;
}

const SkeletonRow: React.FC = () => (
    <tr className="animate-pulse">
        <td className="p-4"><div className="h-4 bg-gray-200 rounded w-3/4 dark:bg-dark-secondary"></div></td>
        <td className="p-4"><div className="h-4 bg-gray-200 rounded w-1/2 dark:bg-dark-secondary"></div></td>
        <td className="p-4"><div className="h-4 bg-gray-200 rounded w-1/4 dark:bg-dark-secondary"></div></td>
        <td className="p-4"><div className="h-4 bg-gray-200 rounded w-1/4 dark:bg-dark-secondary"></div></td>
        <td className="p-4"><div className="h-6 bg-gray-200 rounded-full w-20 dark:bg-dark-secondary"></div></td>
    </tr>
);

const InventoryBalanceList: React.FC<InventoryBalanceListProps> = ({
    balances, isLoading, searchQuery, onSearchChange, selectedMaterialId, onSelectMaterial
}) => {
    
    const getStockStatus = (balance: AggregatedBalance) => {
        const available = balance.current_stock - balance.reserved_stock;
        if (available <= 0) return { label: 'Sem Estoque', variant: 'inativo' as const };
        // Assuming a generic low stock logic for now
        if (available <= 10) return { label: 'Estoque Baixo', variant: 'secondary' as const };
        return { label: 'Em Estoque', variant: 'ativo' as const };
    };

    return (
        <Card>
            <CardContent className="p-0">
                <div className="p-4 border-b border-border dark:border-dark-border">
                    <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <Search className="h-4 w-4 text-textSecondary" />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            placeholder="Buscar por nome ou código..."
                            className="w-full pl-9 pr-3 py-2 border border-border dark:border-dark-border rounded-xl shadow-sm bg-background dark:bg-dark-background focus:outline-none focus:ring-2 focus:ring-primary/50"
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
                    <div className="p-6">
                        <EmptyState 
                            title="Nenhum Material em Estoque"
                            message="Comece cadastrando materiais básicos na tela de Configurações para controlar o estoque."
                        />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-secondary dark:bg-dark-secondary">
                                <tr>
                                    <th className="p-4 font-semibold text-textSecondary dark:text-dark-textSecondary">Material</th>
                                    <th className="p-4 font-semibold text-textSecondary dark:text-dark-textSecondary">Disponível (Total)</th>
                                    <th className="p-4 font-semibold text-textSecondary dark:text-dark-textSecondary">Físico (Total)</th>
                                    <th className="p-4 font-semibold text-textSecondary dark:text-dark-textSecondary">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {balances.map(balance => {
                                    const status = getStockStatus(balance);
                                    const available = balance.current_stock - balance.reserved_stock;
                                    return (
                                        <tr
                                            key={balance.material.id}
                                            onClick={() => onSelectMaterial(balance.material.id)}
                                            className={cn(
                                                'border-b border-border dark:border-dark-border cursor-pointer transition-colors',
                                                selectedMaterialId === balance.material.id ? 'bg-accent dark:bg-dark-accent' : 'hover:bg-accent/50 dark:hover:bg-dark-accent/50'
                                            )}
                                        >
                                            <td className="p-4 font-medium text-textPrimary dark:text-dark-textPrimary">
                                                {balance.material.name}
                                                <span className="block text-xs text-textSecondary dark:text-dark-textSecondary font-mono">{balance.material.sku}</span>
                                            </td>
                                            <td className="p-4 font-bold text-lg text-primary">{available.toFixed(2)} <span className="text-xs font-normal text-textSecondary">{balance.material.unit}</span></td>
                                            <td className="p-4">{balance.current_stock.toFixed(2)}</td>
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
