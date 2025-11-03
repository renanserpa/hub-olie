import React from 'react';
import { Package, AlertTriangle, ArrowRightLeft, DollarSign } from 'lucide-react';

const StatCard: React.FC<{ title: string, value: string | number, icon: React.ElementType }> = ({ title, value, icon: Icon }) => (
    <div className="bg-card dark:bg-dark-card p-4 rounded-xl border border-border dark:border-dark-border">
        <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-textSecondary dark:text-dark-textSecondary">{title}</p>
            <Icon className="w-5 h-5 text-textSecondary dark:text-dark-textSecondary" />
        </div>
        <p className="mt-2 text-2xl font-bold text-textPrimary dark:text-dark-textPrimary">{value}</p>
    </div>
);

interface InventoryKPIRowProps {
    stats: {
        totalValue: number;
        lowStockItems: number;
        totalItems: number;
        transfersThisMonth: number;
    }
}

export const InventoryKPIRow: React.FC<InventoryKPIRowProps> = ({ stats }) => {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard 
                title="Valor Total em Estoque" 
                value={stats.totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} 
                icon={DollarSign} 
            />
            <StatCard 
                title="Itens com Estoque Baixo" 
                value={stats.lowStockItems} 
                icon={AlertTriangle} 
            />
            <StatCard 
                title="Total de Itens" 
                value={stats.totalItems} 
                icon={Package} 
            />
            <StatCard 
                title="Transferências (Mês)" 
                value={stats.transfersThisMonth} 
                icon={ArrowRightLeft} 
            />
        </div>
    );
};
