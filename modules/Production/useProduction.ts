'use client';
import { useEffect, useState, useCallback } from 'react';
import { dataService } from '../../services/dataService';
import { log } from '../../lib/logger';
import { useApp } from '../../contexts/AppContext';
import { toast } from '../../hooks/use-toast';

export interface ProductionOrder {
  id: string;
  order_code: string;
  product_name: string;
  status: string;
  quantity: number;
  start_date?: string;
  end_date?: string;
  assigned_to?: string;
  notes?: string;
}

export function useProduction() {
  const { user } = useApp();
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
    const originalOrders = [...orders];
    // Optimistic update
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    
    try {
        await dataService.updateDocument<ProductionOrder>('production_orders', orderId, { status: newStatus as any });
        toast({ title: "Status Atualizado!", description: `A ordem foi movida para "${newStatus.replace('_', ' ')}".`});
    } catch (error) {
        toast({ title: "Erro!", description: "Não foi possível atualizar o status da ordem.", variant: "destructive" });
        setOrders(originalOrders); // Revert on failure
    }
  }, [orders]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  return { orders, reload: fetchOrders, loading, updateOrderStatus };
}
