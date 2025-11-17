import React from 'react';
import { X, SlidersHorizontal } from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import { ProductAdvancedFilters } from '../../hooks/useProducts';
import { ProductCategory, Collection, ProductStatus } from '../../types';

interface AdvancedFilterPanelProps {
    isOpen: boolean;
    onClose: () => void;
    filters: ProductAdvancedFilters;
    onFiltersChange: (filters: ProductAdvancedFilters) => void;
    onClearFilters: () => void;
    categories: ProductCategory[];
    collections: Collection[];
}

const statusOptions: { value: ProductStatus, label: string }[] = [
    { value: 'Rascunho', label: 'Rascunho' },
    { value: 'Homologado Qualidade', label: 'Homologado' },
    { value: 'Ativo', label: 'Ativo' },
    { value: 'Suspenso', label: 'Suspenso' },
    { value: 'Descontinuado', label: 'Descontinuado' },
];

const AdvancedFilterPanel: React.FC<AdvancedFilterPanelProps> = ({ isOpen, onClose, filters, onFiltersChange, onClearFilters, categories, collections }) => {
    const handleInputChange = (field: keyof ProductAdvancedFilters, value: any) => {
        onFiltersChange({ ...filters, [field]: value });
    };

    const handleStatusChange = (status: ProductStatus) => {
        const newStatus = filters.status.includes(status)
            ? filters.status.filter(s => s !== status)
            : [...filters.status, status];
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
                        <label className={labelStyle}>Categoria</label>
                        <select value={filters.category} onChange={e => handleInputChange('category', e.target.value)} className={cn(inputStyle, "mt-1")}>
                            <option value="">Todas as categorias</option>
                            {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className={labelStyle}>Coleção</label>
                        <select value={filters.collection} onChange={e => handleInputChange('collection', e.target.value)} className={cn(inputStyle, "mt-1")}>
                            <option value="">Todas as coleções</option>
                            {collections.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className={labelStyle}>Status</label>
                        <div className="grid grid-cols-3 gap-2 mt-1">
                            {statusOptions.map(opt => (
                                <label key={opt.value} className="flex items-center gap-2 text-xs p-1.5 border rounded-md has-[:checked]:bg-primary/10 has-[:checked]:border-primary/50 cursor-pointer">
                                    <input type="checkbox" checked={filters.status.includes(opt.value)} onChange={() => handleStatusChange(opt.value)} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"/>
                                    {opt.label}
                                </label>
                            ))}
                        </div>
                    </div>
                     <div>
                        <label className={labelStyle}>Preço Base (R$)</label>
                         <div className="grid grid-cols-2 gap-2 mt-1">
                            <input type="number" placeholder="Mín." value={filters.minPrice} onChange={e => handleInputChange('minPrice', e.target.value === '' ? '' : parseFloat(e.target.value))} className={inputStyle} />
                            <input type="number" placeholder="Máx." value={filters.maxPrice} onChange={e => handleInputChange('maxPrice', e.target.value === '' ? '' : parseFloat(e.target.value))} className={inputStyle} />
                        </div>
                    </div>
                </div>

                <div className="flex-shrink-0 p-4 border-t border-border flex justify-between items-center">
                    <Button variant="ghost" onClick={onClearFilters} className="text-sm">Limpar Filtros</Button>
                    <Button onClick={onClose} className="text-sm">Aplicar</Button>
                </div>
            </div>
        </div>
    );
};

export default AdvancedFilterPanel;
