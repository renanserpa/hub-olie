'use client';
import ProductionKanban from './ProductionKanban';
import ProductionKPIHeader from './ProductionKPIHeader';
import ProductionFilters from './ProductionFilters';
import { useProduction } from './useProduction';
import { useProductionFilters } from './useProductionFilters';
import { useProductionKanban } from './useProductionKanban';
import { Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export default function ProductionPanel() {
  const { filters, updateFilter } = useProductionFilters();
  const { orders, reload, loading, updateOrderStatus } = useProduction(filters);
  const grouped = useProductionKanban(orders);

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-textPrimary">Painel de Produção</h1>
        <Button onClick={reload} variant="outline" disabled={loading}>
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin"/>}
          Recarregar
        </Button>
      </header>

      <ProductionKPIHeader orders={orders} />
      <ProductionFilters filters={filters} updateFilter={updateFilter} />
      {loading ? (
        <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : <ProductionKanban grouped={grouped} onStatusChange={updateOrderStatus} />}
    </div>
  );
}
