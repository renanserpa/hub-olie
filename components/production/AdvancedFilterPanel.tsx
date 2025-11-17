import React from 'react';
import { X, SlidersHorizontal, Download } from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import { Product, ProductionOrderStatus } from '../../types';
import { toast } from '../../hooks/use-toast';

interface AdvancedFilterPanelProps {
    isOpen: boolean;
    onClose: () => void;
    filters: any;
    onFiltersChange: (filters: any) => void;
    onClearFilters: () => void;
    products: Product[];
}

const statusOptions: { value: ProductionOrderStatus, label: string }[] = [
    { value: 'novo', label: 'Nova' },
    { value: 'planejado', label: 'Planejada' },
    { value: 'em_andamento', label: 'Em Andamento' },
    { value: 'em_espera', label: 'Em Espera' },
    { value: 'finalizado', label: 'Finalizada' },
    { value: 'cancelado', label: 'Cancelada' },
];

const AdvancedFilterPanel: React.FC<AdvancedFilterPanelProps> = ({ 
    isOpen, onClose, filters, onFiltersChange, onClearFilters, products 
}) => {
    
    const handleInputChange = (field: string, value: any) => {
        onFiltersChange({ ...filters, [field]: value });
    };

    const handleStatusChange = (status: ProductionOrderStatus) => {
        const currentStatus = filters.status || [];
        const newStatus = currentStatus.includes(status)
            ? currentStatus.filter((s: string) => s !== status)
            : [...currentStatus, status];
        handleInputChange('status', newStatus);
    };
    
    const inputStyle = "w-full p-2 border border-border dark:border-dark-border rounded-md bg-background dark:bg-dark-background focus:outline-none focus:ring-1 focus:ring-primary/50 text-sm";
    const labelStyle = "text-sm font-medium text-textPrimary dark:text-dark-textPrimary";

    return (
        <div
            className={cn("fixed inset-0 bg-black/60 z-40 transition-opacity", isOpen ? "opacity-100" : "opacity-0 pointer-events-none")}
        >
            <div
                className={cn("fixed top-0 right-0 h-full w-full max-w-sm bg-card dark:bg-dark-card shadow-lg flex flex-col transition-transform duration-300", isOpen ? "translate-x-0" : "translate-x-full")}
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4 border-b border-border dark:border-dark-border flex-shrink-0">
                    <h2 className="text-lg font-semibold flex items-center gap-2"><SlidersHorizontal size={18}/> Filtros Avançados</h2>
                    <Button variant="ghost" size="icon" onClick={onClose}><X /></Button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <div>
                        <label className={labelStyle}>Status da OP</label>
                        <div className="grid grid-cols-3 gap-2 mt-1">
                            {statusOptions.map(opt => (
                                <label key={opt.value} className="flex items-center gap-2 text-xs p-1.5 border rounded-md has-[:checked]:bg-primary/10 has-[:checked]:border-primary/50 cursor-pointer">
                                    <input type="checkbox" checked={(filters.status || []).includes(opt.value)} onChange={() => handleStatusChange(opt.value)} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"/>
                                    {opt.label}
                                </label>
                            ))}
                        </div>
                    </div>
                     <div>
                        <label className={labelStyle}>Produto Associado</label>
                        <select value={filters.productId || ''} onChange={e => handleInputChange('productId', e.target.value)} className={cn(inputStyle, "mt-1")}>
                            <option value="">Todos os produtos</option>
                            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className={labelStyle}>Período de Criação da OP</label>
                        <div className="grid grid-cols-2 gap-2 mt-1">
                            <input type="date" value={filters.startDate || ''} onChange={e => handleInputChange('startDate', e.target.value)} className={inputStyle} />
                            <input type="date" value={filters.endDate || ''} onChange={e => handleInputChange('endDate', e.target.value)} className={inputStyle} />
                        </div>
                    </div>
                     <div>
                        <label className={labelStyle}>Quantidade Produzida</label>
                         <div className="grid grid-cols-2 gap-2 mt-1">
                            <input type="number" placeholder="Mín." value={filters.minQty || ''} onChange={e => handleInputChange('minQty', e.target.value === '' ? '' : parseFloat(e.target.value))} className={inputStyle} />
                            <input type="number" placeholder="Máx." value={filters.maxQty || ''} onChange={e => handleInputChange('maxQty', e.target.value === '' ? '' : parseFloat(e.target.value))} className={inputStyle} />
                        </div>
                    </div>
                    <div>
                        <label className={cn(labelStyle, "text-textSecondary/50")}>Custo Estimado (R$)</label>
                         <div className="grid grid-cols-2 gap-2 mt-1">
                            <input type="number" placeholder="Mín." disabled className={cn(inputStyle, "cursor-not-allowed bg-secondary/50")} title="Em breve" />
                            <input type="number" placeholder="Máx." disabled className={cn(inputStyle, "cursor-not-allowed bg-secondary/50")} title="Em breve" />
                        </div>
                    </div>
                </div>

                <div className="flex-shrink-0 p-4 border-t border-border dark:border-dark-border flex justify-between items-center">
                    <Button variant="ghost" onClick={onClearFilters} className="text-sm">Limpar Filtros</Button>
                    <div className="flex items-center gap-2">
                         <Button variant="outline" className="text-sm" onClick={() => toast({title: 'Em breve!', description: 'A exportação para planilhas será implementada em breve.'})}>
                            <Download size={14} className="mr-2"/>
                            Exportar
                        </Button>
                        <Button onClick={onClose} className="text-sm">Aplicar</Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdvancedFilterPanel;