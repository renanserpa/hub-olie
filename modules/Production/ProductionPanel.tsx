'use client';
import React, { useMemo } from 'react';
import ProductionKanban from './ProductionKanban';
import ProductionKPIHeader from './ProductionKPIHeader';
import ProductionFilters from './ProductionFilters';
import { useProduction } from './useProduction';
import { useProductionFilters } from './useProductionFilters';
import { Button } from '../../components/ui/Button';
import { Loader2 } from 'lucide-react';
import ProductionDrawer from './ProductionDrawer';

export default function ProductionPanel() {
  const { orders: allOrders, reload, loading, updateOrderStatus, selectedOrder, setSelectedOrderId } = useProduction();
  const { filters, updateFilter } = useProductionFilters();

  const filteredOrders = useMemo(() => {
    if (loading) return [];
    return allOrders.filter(o => 
      (filters.status === 'all' || o.status === filters.status) &&
      (filters.search === '' || 
        (o.product?.name || '').toLowerCase().includes(filters.search.toLowerCase()) ||
        (o.po_number && o.po_number.toLowerCase().includes(filters.search.toLowerCase())))
    );
  }, [allOrders, filters, loading]);

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Produção</h1>
        <button
          onClick={reload}
          className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
          disabled={loading}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin"/> : 'Recarregar'}
        </button>
      </header>

      <ProductionKPIHeader orders={allOrders} />
      <ProductionFilters filters={filters} updateFilter={updateFilter} />
      {loading ? <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div> : <ProductionKanban orders={filteredOrders} onStatusChange={updateOrderStatus} onCardClick={setSelectedOrderId} />}
    
      <ProductionDrawer
        order={selectedOrder}
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrderId(null)}
      />
    </div>
  );
}
