import React from 'react';
import { Search, Plus, LayoutGrid, List, Columns } from 'lucide-react';
import { Button } from '../ui/Button';
import { ProductionViewMode } from '../../hooks/useProduction';

interface ProductionFilterBarProps {
    onNewOrderClick: () => void;
    viewMode: ProductionViewMode;
    onViewModeChange: (mode: ProductionViewMode) => void;
    // Search functionality can be added later
}

const ProductionFilterBar: React.FC<ProductionFilterBarProps> = ({ onNewOrderClick, viewMode, onViewModeChange }) => {
    return (
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
             <div>
                <h1 className="text-3xl font-bold text-textPrimary">Produção</h1>
                <p className="text-textSecondary mt-1">Controle o chão de fábrica, da matéria-prima ao produto acabado.</p>
            </div>
            <div className="flex items-center gap-4">
                 <div className="relative flex-1 sm:flex-initial sm:w-64">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Search className="h-4 w-4 text-textSecondary" />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar por OP ou produto..."
                        className="w-full pl-9 pr-3 py-2 border border-border rounded-xl shadow-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                </div>
                <div className="flex items-center p-1 rounded-lg bg-secondary dark:bg-dark-secondary">
                    <Button 
                        variant={viewMode === 'kanban' ? 'primary' : 'ghost'} 
                        size="sm" 
                        onClick={() => onViewModeChange('kanban')} 
                        className="h-8 w-8 p-0"
                        aria-label="Visualização em Kanban"
                    >
                        <LayoutGrid size={16} />
                    </Button>
                    <Button 
                        variant={viewMode === 'list' ? 'primary' : 'ghost'} 
                        size="sm" 
                        onClick={() => onViewModeChange('list')} 
                        className="h-8 w-8 p-0"
                        aria-label="Visualização em Lista"
                    >
                        <List size={16} />
                    </Button>
                    <Button 
                        variant={viewMode === 'table' ? 'primary' : 'ghost'} 
                        size="sm" 
                        onClick={() => onViewModeChange('table')} 
                        className="h-8 w-8 p-0"
                        aria-label="Visualização em Tabela"
                    >
                        <Columns size={16} />
                    </Button>
                </div>
                <Button onClick={onNewOrderClick}><Plus className="w-4 h-4 mr-2" />Nova OP Manual</Button>
            </div>
        </div>
    );
};

export default ProductionFilterBar;