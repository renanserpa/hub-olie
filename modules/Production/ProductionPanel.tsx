import React, { useState } from 'react';
import { useProduction, ProductionViewMode } from './useProduction';
import { Loader2, LayoutGrid, GanttChartSquare, ShieldCheck, Settings } from 'lucide-react';
import ProductionDrawer from './ProductionDrawer';
import ProductionKpiRow from '../../components/production/ProductionKpiRow';
import ProductionKanban from './ProductionKanban';
import { useApp } from '../../contexts/AppContext';
import TabLayout from '../../components/ui/TabLayout';
import ProductionTimeline from './ProductionTimeline';
import ProductionQualityPanel from './ProductionQualityPanel';
import PlaceholderContent from '../../components/PlaceholderContent';

const TABS = [
  { id: 'kanban', label: 'Kanban de OPs', icon: LayoutGrid },
  { id: 'timeline', label: 'Cronograma', icon: GanttChartSquare },
  { id: 'quality', label: 'Qualidade', icon: ShieldCheck },
  { id: 'settings', label: 'Configurações', icon: Settings },
];

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

  const [activeTab, setActiveTab] = useState('kanban');

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }
  
  const renderContent = () => {
    switch(activeTab) {
      case 'kanban':
        return (
          <ProductionKanban 
            orders={filteredOrders} 
            onStatusChange={updateProductionOrderStatus} 
            onCardClick={setSelectedOrderId} 
          />
        );
      case 'timeline':
        return <ProductionTimeline orders={filteredOrders} />;
      case 'quality':
        return <ProductionQualityPanel checks={filteredOrders.flatMap(o => o.quality_checks || [])} />;
      case 'settings':
        return <PlaceholderContent title="Configurações de Produção" requiredTable="production_routes" icon={Settings} />;
      default:
        return null;
    }
  }
  
  return (
    <div className="space-y-6">
      <ProductionKpiRow kpis={kpis} />

      <TabLayout tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="mt-6">
        {renderContent()}
      </div>
    
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