import React, { useState, useRef, useEffect } from 'react';
import { Search, Plus, LayoutGrid, List, SlidersHorizontal, Columns, Grid3x3 } from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import { ViewMode, ProductColumn } from '../../hooks/useProducts';

interface ProductFilterBarProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onNewProductClick: () => void;
    viewMode: ViewMode;
    onViewModeChange: (mode: ViewMode) => void;
    onAdvancedFilterClick: () => void;
    visibleColumns: Set<ProductColumn>;
    toggleColumnVisibility: (column: ProductColumn) => void;
}

const ColumnToggler: React.FC<{
    visibleColumns: Set<ProductColumn>;
    toggleColumnVisibility: (column: ProductColumn) => void;
}> = ({ visibleColumns, toggleColumnVisibility }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const columns: { key: ProductColumn, label: string }[] = [
        { key: 'category', label: 'Categoria' },
        { key: 'collection_ids', label: 'Coleção' },
        { key: 'available_sizes', label: 'Tamanhos' },
        { key: 'variants', label: 'Variantes' },
        { key: 'status', label: 'Status' },
    ];

     useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [ref]);

    return (
        <div className="relative" ref={ref}>
            <Button variant="outline" size="sm" onClick={() => setIsOpen(!isOpen)}>
                <Columns size={14} className="mr-2" />
                Colunas
            </Button>
            {isOpen && (
                <div className="absolute z-10 top-full right-0 mt-2 w-48 bg-card border rounded-md shadow-lg p-2">
                    {columns.map(col => (
                        <label key={col.key} className="flex items-center gap-2 p-1.5 rounded hover:bg-accent text-sm cursor-pointer">
                            <input
                                type="checkbox"
                                checked={visibleColumns.has(col.key)}
                                onChange={() => toggleColumnVisibility(col.key)}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            {col.label}
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
}


const ProductFilterBar: React.FC<ProductFilterBarProps> = ({
    searchQuery,
    onSearchChange,
    onNewProductClick,
    viewMode,
    onViewModeChange,
    onAdvancedFilterClick,
    visibleColumns,
    toggleColumnVisibility,
}) => {
    return (
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
             <div className="relative flex-1 sm:flex-initial sm:w-64">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="h-4 w-4 text-textSecondary" />
                </div>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Buscar por nome ou SKU..."
                    className="w-full pl-9 pr-3 py-2 border border-border rounded-xl shadow-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
            </div>
            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={onAdvancedFilterClick}>
                    <SlidersHorizontal size={14} className="mr-2" />
                    Filtros
                </Button>
                {viewMode === 'list' && <ColumnToggler visibleColumns={visibleColumns} toggleColumnVisibility={toggleColumnVisibility} />}
                <div className="flex items-center p-1 rounded-lg bg-secondary dark:bg-dark-secondary">
                    <Button 
                        variant={viewMode === 'list' ? 'primary' : 'ghost'} 
                        size="sm" onClick={() => onViewModeChange('list')} className="h-8 w-8 p-0" title="Lista">
                        <List size={16} />
                    </Button>
                    <Button 
                        variant={viewMode === 'gallery' ? 'primary' : 'ghost'} 
                        size="sm" onClick={() => onViewModeChange('gallery')} className="h-8 w-8 p-0" title="Galeria">
                        <Grid3x3 size={16} />
                    </Button>
                    <Button 
                        variant={viewMode === 'kanban' ? 'primary' : 'ghost'} 
                        size="sm" onClick={() => onViewModeChange('kanban')} className="h-8 w-8 p-0" title="Kanban">
                        <LayoutGrid size={16} />
                    </Button>
                </div>
                <Button onClick={onNewProductClick}><Plus className="w-4 h-4 mr-2" />Novo Produto</Button>
            </div>
        </div>
    );
};

export default ProductFilterBar;
