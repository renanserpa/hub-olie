import React from 'react';
import { useProduction, ProductionViewMode } from './useProduction';
import { Loader2 } from 'lucide-react';
import ProductionDrawer from './ProductionDrawer';
import ProductionKpiRow from '../../components/production/ProductionKpiRow';
import ProductionKanban from './ProductionKanban';
import { useApp } from '../../contexts/AppContext';

export default function ProductionPanel() {
  const { user } = useApp();
  const { 
    filteredOrders,
    isLoading, 
    updateProductionOrderStatus, 
    updateTaskStatus,
    createQualityCheck,
    selectedOrder, 
    setSelectedOrderId,
    kpis,
    allMaterials,
  } = useProduction();

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }
  
  return (
    <div className="space-y-6">
      <ProductionKpiRow kpis={kpis} />
      
      <ProductionKanban 
        orders={filteredOrders} 
        onStatusChange={updateProductionOrderStatus} 
        onCardClick={setSelectedOrderId} 
      />
    
      <ProductionDrawer
        order={selectedOrder}
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrderId(null)}
        allMaterials={allMaterials}
        onUpdateTaskStatus={updateTaskStatus}
        onCreateQualityCheck={createQualityCheck}
        user={user}
      />
    </div>
  );
}