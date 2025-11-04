import React from 'react';
import { ProductionOrderStatus } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Search, X } from 'lucide-react';
import { Button } from '../ui/Button';

interface ProductionOrderFiltersProps {
    filters: { search: string, status: ProductionOrderStatus[] };
    onFilterChange: (filters: { search: string, status: ProductionOrderStatus[] }) => void;
    statusCounts: Record<ProductionOrderStatus | 'all', number>;
}

const STATUS_OPTIONS: { id: ProductionOrderStatus; label: string }[] = [
    { id: 'novo', label: 'Nova' },
    { id: 'planejado', label: 'Planejada' },
    { id: 'em_andamento', label: 'Em Andamento' },
    { id: 'em_espera', label: 'Em Espera' },
    { id: 'finalizado', label: 'Finalizada' },
    { id: 'cancelado', label: 'Cancelada' },
];

const ProductionOrderFilters: React.FC<ProductionOrderFiltersProps> = ({ filters, onFilterChange, statusCounts }) => {

    const handleStatusChange = (status: ProductionOrderStatus) => {
        const currentStatuses = filters.status;
        const newStatuses = currentStatuses.includes(status)
            ? currentStatuses.filter(s => s !== status)
            : [...currentStatuses, status];
        onFilterChange({ ...filters, status: newStatuses });
    };

    const clearFilters = () => onFilterChange({ search: '', status: [] });
    const hasActiveFilters = filters.search !== '' || filters.status.length > 0;

    return (
        <Card className="sticky top-20">
            <CardHeader className="flex-row items-center justify-between">
                <CardTitle className="text-lg">Filtros de OPs</CardTitle>
                {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs">
                        <X className="w-3 h-3 mr-1" />
                        Limpar
                    </Button>
                )}
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <label htmlFor="search-po" className="sr-only">Buscar OP</label>
                    <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <Search className="h-4 w-4 text-textSecondary" />
                        </div>
                        <input
                            type="text"
                            id="search-po"
                            value={filters.search}
                            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
                            placeholder="Buscar OP, produto..."
                            className="w-full pl-9 pr-3 py-2 border border-border rounded-xl shadow-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                    </div>
                </div>

                <div>
                    <h4 className="font-medium text-sm text-textPrimary mb-3">Status</h4>
                    <div className="space-y-2">
                        {STATUS_OPTIONS.map(opt => (
                            <label key={opt.id} className="flex items-center justify-between text-sm cursor-pointer">
                                <span className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={filters.status.includes(opt.id)}
                                        onChange={() => handleStatusChange(opt.id)}
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    {opt.label}
                                </span>
                                <span className="text-xs bg-secondary px-1.5 py-0.5 rounded-full text-textSecondary font-medium">
                                    {statusCounts[opt.id] || 0}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

            </CardContent>
        </Card>
    );
};

export default ProductionOrderFilters;