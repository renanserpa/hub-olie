import React, { useState } from 'react';
import { Columns, LayoutGrid, List, Maximize, SlidersHorizontal, Workflow } from 'lucide-react';
import { Button } from './ui/Button';
import { useProductionOrders } from '../hooks/useProductionOrders';
import ProductionOrderFilters from './production/ProductionOrderFilters';
import ProductionOrderList from './production/ProductionOrderList';
import ProductionOrderDetailPanel from './production/ProductionOrderDetailPanel';
import { Card } from './ui/Card';
import { useProductionKanban } from '../hooks/useProductionKanban';
import KanbanBoard from './production/KanbanBoard';
import { cn } from '../lib/utils';
import { Material } from '../types';

type ViewMode = 'kanban' | 'list';

const ProductionPage: React.FC = () => {
    const [viewMode, setViewMode] = useState<ViewMode>('kanban');

    // Hooks for both views
    const kanban = useProductionKanban();
    const list = useProductionOrders();

    const renderListView = () => (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-3">
                <ProductionOrderFilters 
                    filters={list.filters} 
                    updateFilters={list.updateFilters} 
                    clearFilters={list.clearFilters} 
                    statusCounts={list.statusCounts} 
                />
            </div>
            <div className="lg:col-span-5 min-w-0">
                <ProductionOrderList 
                    orders={list.filteredOrders} 
                    isLoading={list.isLoading} 
                    selectedOrderId={list.selectedOrder?.id || null}
                    onSelectOrder={list.setSelectedOrderId}
                />
            </div>
            <div className="lg:col-span-4">
                {list.selectedOrder ? (
                    <ProductionOrderDetailPanel 
                        order={list.selectedOrder} 
                        allMaterials={list.allMaterials as Material[]}
                        key={list.selectedOrder.id} 
                    />
                ) : !list.isLoading ? (
                    <Card className="sticky top-20 h-[calc(100vh-10rem)] flex items-center justify-center">
                        <div className="text-center text-textSecondary">
                            <p>Selecione uma OP para ver os detalhes</p>
                        </div>
                    </Card>
                ) : null}
            </div>
        </div>
    );

    const renderKanbanView = () => (
        <KanbanBoard 
            tasks={kanban.tasks}
            statuses={kanban.statuses}
            onTaskMove={kanban.moveTask}
            isLoading={kanban.isLoading}
        />
    );

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                 <div>
                    <h1 className="text-3xl font-bold text-textPrimary">Produção</h1>
                    <p className="text-textSecondary mt-1">Kanban de produção com SLA</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="text-textSecondary">
                        <SlidersHorizontal size={14} className="mr-2" />
                        Colunas ({kanban.statuses.length})
                    </Button>
                    <div className="flex items-center p-1 rounded-lg bg-secondary">
                       <Button 
                         variant={viewMode === 'kanban' ? 'primary' : 'ghost'} 
                         size="sm" 
                         onClick={() => setViewMode('kanban')} 
                         className="h-8 w-8 p-0"
                       >
                           <LayoutGrid size={16} />
                       </Button>
                        <Button 
                          variant={viewMode === 'list' ? 'primary' : 'ghost'} 
                          size="sm" 
                          onClick={() => setViewMode('list')} 
                          className="h-8 w-8 p-0"
                        >
                            <List size={16} />
                        </Button>
                    </div>
                     <Button variant="outline" className="text-textSecondary">
                        <Maximize size={14} className="mr-2" />
                        Modo TV
                    </Button>
                </div>
            </div>
            
            {viewMode === 'kanban' ? renderKanbanView() : renderListView()}

        </div>
    );
};

export default ProductionPage;