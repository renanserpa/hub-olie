'use client';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { dataService } from '../../services/dataService';
import { log } from '../../lib/logger';
import { useApp } from '../../contexts/AppContext';
import { toast } from '../../hooks/use-toast';
// FIX: Imported ProductionOrder type to be used within this module.
import { Task, TaskStatus, Product, ProductionOrder } from '../../types';
// FIX: Re-export ProductionOrder type to be available to other components within the module.
export type { ProductionOrder } from '../../types';


export function useProduction() {
  const { user } = useApp();
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskStatuses, setTaskStatuses] = useState<TaskStatus[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    log.info('[Production] Loading production data...');
    try {
        const [ordersData, tasksData, taskStatusesData, productsData] = await Promise.all([
            dataService.getCollection<ProductionOrder>('production_orders'),
            dataService.getCollection<Task>('tasks'),
            dataService.getCollection<TaskStatus>('task_statuses'),
            dataService.getCollection<Product>('products'),
        ]);
        setOrders(ordersData || []);
        setTasks(tasksData || []);
        setTaskStatuses(taskStatusesData || []);
        setProducts(productsData || []);
    } catch (error) {
        toast({ title: "Erro de Produção", description: "Não foi possível carregar os dados.", variant: "destructive" });
    } finally {
        setLoading(false);
    }
  }, []);

  const updateOrderStatus = useCallback(async (orderId: string, newStatus: string) => {
    const originalOrders = [...orders];
    // Optimistic update
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus as ProductionOrder['status'] } : o));
    
    try {
        await dataService.updateDocument<ProductionOrder>('production_orders', orderId, { status: newStatus as any });
        toast({ title: "Status Atualizado!", description: `A ordem foi movida para "${newStatus.replace('_', ' ')}".`});
    } catch (error) {
        toast({ title: "Erro!", description: "Não foi possível atualizar o status da ordem.", variant: "destructive" });
        setOrders(originalOrders); // Revert on failure
    }
  }, [orders]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);
  
  const ordersWithDetails = useMemo(() => {
    const taskStatusMap = new Map(taskStatuses.map(ts => [ts.id, ts.name]));
    return orders.map(order => {
        const orderTasks = tasks
            .filter(task => task.title.startsWith(order.po_number || ''))
            .map(task => ({
                ...task,
                statusName: taskStatusMap.get(task.status_id) || 'Desconhecido'
            }));
        const product = products.find(p => p.id === order.product_id);
        return {
            ...order,
            product,
            tasks: orderTasks
        }
    })
  }, [orders, tasks, taskStatuses, products]);

  const selectedOrder = useMemo(() => {
    return ordersWithDetails.find(o => o.id === selectedOrderId) || null;
  }, [ordersWithDetails, selectedOrderId]);


  return { 
      orders: ordersWithDetails, 
      reload: fetchOrders, 
      loading, 
      updateOrderStatus,
      selectedOrder,
      setSelectedOrderId
    };
}