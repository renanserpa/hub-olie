

import { useState, useEffect, useMemo, useCallback } from 'react';
import { ProductionOrder, ProductionOrderStatus } from '../types';
import { firebaseService } from '../services/firestoreService';
import { toast } from './use-toast';

export type ProductionOrderFiltersState = {
    search: string;
    status: ProductionOrderStatus[];
};

export function useProductionOrders() {
    const [allOrders, setAllOrders] = useState<ProductionOrder[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filters, setFilters] = useState<ProductionOrderFiltersState>({ search: '', status: [] });
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

    const loadOrders = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await firebaseService.getProductionOrders();
            setAllOrders(data);
            if (data.length > 0 && !selectedOrderId) {
                // Pre-select the first order on initial load
                setSelectedOrderId(data[0].id);
            }
        } catch (error) {
            toast({ title: "Erro!", description: "Não foi possível carregar as ordens de produção.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadOrders();
    }, [loadOrders]);

    const statusCounts = useMemo(() => {
        const counts: Record<ProductionOrderStatus | 'all', number> = {
            all: allOrders.length,
            novo: 0,
            planejado: 0,
            em_andamento: 0,
            em_espera: 0,
            finalizado: 0,
            cancelado: 0,
        };
        allOrders.forEach(order => {
            counts[order.status]++;
        });
        return counts;
    }, [allOrders]);
    
    const filteredOrders = useMemo(() => {
        return allOrders.filter(order => {
            const searchMatch = filters.search.length === 0 ||
                order.po_number.toLowerCase().includes(filters.search.toLowerCase()) ||
                (order.product?.name && order.product.name.toLowerCase().includes(filters.search.toLowerCase()));

            const statusMatch = filters.status.length === 0 || filters.status.includes(order.status);

            return searchMatch && statusMatch;
        });
    }, [allOrders, filters]);
    
    const selectedOrder = useMemo(() => {
        return allOrders.find(o => o.id === selectedOrderId) || null;
    }, [allOrders, selectedOrderId]);

    const updateFilters = (newFilters: Partial<ProductionOrderFiltersState>) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    };

    const clearFilters = () => {
        setFilters({ search: '', status: [] });
    };

    // When filters change, if the currently selected order is no longer in the filtered list,
    // select the first item from the new filtered list.
    useEffect(() => {
        if(selectedOrderId && !filteredOrders.find(o => o.id === selectedOrderId)) {
             setSelectedOrderId(filteredOrders[0]?.id || null);
        }
    }, [filteredOrders, selectedOrderId]);

    return {
        allOrders,
        filteredOrders,
        isLoading,
        filters,
        updateFilters,
        clearFilters,
        statusCounts,
        selectedOrder,
        setSelectedOrderId,
    };
}