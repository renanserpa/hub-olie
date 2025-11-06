import { useMemo } from 'react';
import { ProductionOrder } from '../../types';

export function useProductionKanban(orders: ProductionOrder[]) {
  return useMemo(() => {
    const columns = ['pending','in_progress','quality_check','completed','paused'];
    const grouped: Record<string, ProductionOrder[]> = {};
    columns.forEach((col) => grouped[col] = []);
    orders.forEach((o) => {
        if (grouped[o.status]) {
            grouped[o.status].push(o)
        }
    });
    return grouped;
  }, [orders]);
}