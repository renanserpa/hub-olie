'use client';
import React, { useMemo } from 'react';
import { useProduction } from './useProduction';
import { Loader2 } from 'lucide-react';
import ProductionDrawer from '../../components/production/ProductionDrawer';
import ProductionTable from '../../components/production/ProductionTable';
import ProductionDialog from '../../components/production/ProductionDialog';
import ProductionKpiRow from '../../components/production/ProductionKpiRow';
import ProductionFilterBar from '../../components/production/ProductionFilterBar';
import ProductionKanban from '../../components/production/ProductionKanban';
import AdvancedFilterPanel from '../../components/production/AdvancedFilterPanel';

export default function ProductionPanel() {
  const { 
    filteredOrders,
    isLoading, 
    updateProductionOrderStatus, 
    selectedOrder, 
    setSelectedOrderId,
    kpis,
    filters,
    setFilters,
    viewMode,
    setViewMode,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    createProductionOrder,
    allProducts,
    isSaving,
    isAdvancedFilterOpen,
    setIsAdvancedFilterOpen,
    clearFilters
  } = useProduction();

  const renderContent = () => {
    if (isLoading) {
      return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
    }
    
    switch (viewMode) {
        case 'table':
            return <ProductionTable orders={filteredOrders} onOrderSelect={setSelectedOrderId} />;
        case 'kanban':
        default:
            return <ProductionKanban orders={filteredOrders} onStatusChange={updateProductionOrderStatus} onCardClick={setSelectedOrderId} />;
    }
  };


  return (
    <div className="space-y-6">
      <ProductionFilterBar 
        filters={filters}
        onFiltersChange={setFilters}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onNewOrderClick={() => setIsCreateDialogOpen(true)}
        onAdvancedFilterClick={() => setIsAdvancedFilterOpen(true)}
      />

      <ProductionKpiRow kpis={kpis} />
      
      {renderContent()}
    
      <ProductionDrawer
        order={selectedOrder}
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrderId(null)}
        onUpdateTaskStatus={() => {}} // Placeholder
        onCreateQualityCheck={() => {}} // Placeholder
        allMaterials={[]} // Placeholder
      />
      <ProductionDialog 
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSave={createProductionOrder}
        products={allProducts}
        isSaving={isSaving}
      />
      <AdvancedFilterPanel
        isOpen={isAdvancedFilterOpen}
        onClose={() => setIsAdvancedFilterOpen(false)}
        filters={filters}
        onFiltersChange={setFilters}
        onClearFilters={clearFilters}
        products={allProducts}
      />
    </div>
  );
}
