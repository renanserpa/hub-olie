import { useState, useMemo } from 'react';
import { ProductionOrder, ProductionOrderStatus } from '../types';

export interface ProductionOrderFiltersState {
  search: string;
  status: ProductionOrderStatus[];
}

// Note: This hook is implemented to resolve a build error in ProductionOrderFilters.tsx.
// It is not currently used in the main application flow but provides filtering logic
// for production orders if needed in the future.
export function useProductionOrders(allOrders: ProductionOrder[]) {
  const [filters, setFilters] = useState<ProductionOrderFiltersState>({
    search: '',
    status: [],
  });

  const updateFilters = (newFilters: Partial<ProductionOrderFiltersState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => setFilters({ search: '', status: [] });

  const filteredOrders = useMemo(() => {
    if (!allOrders) return [];
    return allOrders.filter(order => {
        const searchMatch = filters.search === '' || 
                            order.po_number.toLowerCase().includes(filters.search.toLowerCase()) || 
                            (order.product && order.product.name.toLowerCase().includes(filters.search.toLowerCase()));
        
        const statusMatch = filters.status.length === 0 || filters.status.includes(order.status);
        
        return searchMatch && statusMatch;
    });
  }, [allOrders, filters]);

  const statusCounts = useMemo(() => {
    const counts: Record<ProductionOrderStatus | 'all', number> = {
      all: allOrders?.length || 0,
      novo: 0,
      planejado: 0,
      em_andamento: 0,
      em_espera: 0,
      finalizado: 0,
      cancelado: 0,
    };
    if (allOrders) {
        for (const order of allOrders) {
          if (counts[order.status] !== undefined) {
            counts[order.status]++;
          }
        }
    }
    return counts;
  }, [allOrders]);

  return {
    filters,
    updateFilters,
    clearFilters,
    filteredOrders,
    statusCounts,
  };
}
