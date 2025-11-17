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
    isLoading: boolean;
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
    isLoading,
}) => {
    return (
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
             <div className="relative flex-1 sm:flex-initial sm:w-64">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="h-4 w-4 text-textSecondary" />
                