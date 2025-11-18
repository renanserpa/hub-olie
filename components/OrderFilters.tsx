import React from 'react';
import { Search, Plus, LayoutGrid, List, Columns, SlidersHorizontal, ArrowLeft } from 'lucide-react';
import { Button } from './ui/Button';
import { cn } from '../lib/utils';
import { useApp } from '../contexts/AppContext';

type ViewMode = 'kanban' | 'list' | 'table';

interface OrderFiltersProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onNewOrderClick: () => void;
    onAdvancedFilterClick: () => void;
    viewMode: ViewMode;
    onViewModeChange: (mode: ViewMode) => void;
}

const OrderFilters: React.FC<OrderFiltersProps> = ({ searchQuery, onSearchChange, onNewOrderClick, onAdvancedFilterClick, viewMode, onViewModeChange }) => {
    const { setActiveModule } = useApp();

    return (
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
                <Button variant="ghost" onClick={() => setActiveModule('orders')}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar
                </Button>
            </div>

            <div className="flex items-center gap-2">
                 <div className="relative flex-1 sm:flex-initial sm:w-64">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Search className="h-4 w-4 text-textSecondary" />
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Buscar por nº ou cliente..."
                        className="w-full pl-9 pr-3 py-2 border border-border rounded-xl shadow-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                </div>
                <Button variant="outline" onClick={onAdvancedFilterClick}>
                    <SlidersHorizontal size={14} className="mr-2" />
                    Filtros
                </Button>
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
                <Button onClick={onNewOrderClick}><Plus className="w-4 h-4 mr-2" />Novo Pedido</Button>
            </div>
        </div>
    );
};

export default OrderFilters;