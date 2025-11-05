'use client';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { dataService } from '../../services/dataService';
import { log } from '../../lib/logger';
import { ProductionOrder } from '../../types';
import { toast } from '../../hooks/use-toast';

export function useProduction(filters: { status: string; search: string; }) {
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    log.info('[Production] Loading production orders...');
    const data = await dataService.getCollection<ProductionOrder>('production_orders');
    setOrders(data || []);
    setLoading(false);
  }, []);

  const updateOrderStatus = useCallback(async (orderId: string, newStatus: string) => {
    log.info('[Production] Updating order status:', orderId, newStatus);
    
    const originalOrders = orders;
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus as any } : o)));

    try {
        // FIX: Explicitly provide the generic type to `updateDocument` to resolve type error.
        await dataService.updateDocument<ProductionOrder>('production_orders', orderId, { status: newStatus as any });
        toast({ title: "Status atualizado!", description: `Ordem movida para "${newStatus}".` });
    } catch(e) {
        toast({ title: "Erro!", description: "Não foi possível atualizar o status.", variant: 'destructive' });
        setOrders(originalOrders);
    }
  }, [orders]);
  
  const filteredOrders = useMemo(() => {
    return orders.filter((o: ProductionOrder) => 
        (filters.status === 'all' || o.status === filters.status) &&
        (filters.search === '' || 
          o.product_name.toLowerCase().includes(filters.search.toLowerCase()) ||
          o.order_code.toLowerCase().includes(filters.search.toLowerCase())
        )
    );
  }, [orders, filters]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  return { orders: filteredOrders, reload: fetchOrders, loading, updateOrderStatus };
}
