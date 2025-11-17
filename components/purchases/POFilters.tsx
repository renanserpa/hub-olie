import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Search, X } from 'lucide-react';
import { Button } from '../ui/Button';
// FIX: Import the PurchaseOrderStatus type
import { PurchaseOrderStatus } from '../../types';

interface POFiltersProps {
    filters: { search: string, status: PurchaseOrderStatus[] };
    onFiltersChange: (filters: { search: string, status: PurchaseOrderStatus[] }) => void;
}

const POFilters: React.FC<POFiltersProps> = ({ filters, onFiltersChange }) => {
    return (
        <Card className="sticky top-20">
            <CardHeader>
                <CardTitle className="text-lg">Filtros de POs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <label htmlFor="search-po" className="sr-only">Buscar PO</label>
                    <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <Search className="h-4 w-4 text-textSecondary" />
                        </div>
                        <input
                            type="text"
                            id="search-po"
                            value={filters.search}
                            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
                            placeholder="Buscar por nº ou fornecedor..."
                            className="w-full pl-9 pr-3 py-2 border border-border rounded-xl shadow-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                    </div>
                </div>
                {/* Add status filters here later */}
            </CardContent>
        </Card>
    );
};

export default POFilters;