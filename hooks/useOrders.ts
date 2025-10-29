import { useState, useEffect, useMemo, useCallback } from 'react';
import { Order, Contact, Product, OrderStatus, AppData } from '../types';
import { dataService } from '../services/dataService';
import { toast } from './use-toast';

export function useOrders() {
    const [allOrders, setAllOrders] = useState<Order[]>([]);
    const [allContacts, setAllContacts] = useState<Contact[]>([]);
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [settingsData, setSettingsData] = useState<AppData | null>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<OrderStatus[]>([]);

    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [ordersData, contactsData, productsData, settings] = await Promise.all([
                dataService.getOrders(),
                dataService.getContacts(),
                dataService.getProducts(),
                dataService.getSettings(),
            ]);
            setAllOrders(ordersData);
            setAllContacts(contactsData);
            setAllProducts(productsData);
            setSettingsData(settings);
        } catch (error) {
             toast({ title: "Erro!", description: "Não foi possível carregar os dados dos pedidos.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const filteredOrders = useMemo(() => {
        return allOrders.filter(order => {
            const searchMatch = searchQuery.length === 0 ||
                order.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (order.customers?.name && order.customers.name.toLowerCase().includes(searchQuery.toLowerCase()));

            const statusMatch = statusFilter.length === 0 || statusFilter.includes(order.status);

            return searchMatch && statusMatch;
        });
    }, [allOrders, searchQuery, statusFilter]);
    
    const selectedOrder = useMemo(() => {
        return allOrders.find(o => o.id === selectedOrderId) || null;
    }, [allOrders, selectedOrderId]);

    const updateOrderStatus = useCallback(async (orderId: string, newStatus: OrderStatus) => {
        setIsSaving(true);
        try {
            await dataService.updateOrderStatus(orderId, newStatus);
            toast({ title: "Status Atualizado!", description: `O pedido foi movido para "${newStatus}".`});
            // Optimistic update
            setAllOrders(prev => prev.map(o => o.id === orderId ? {...o, status: newStatus} : o));
        } catch (error) {
            toast({ title: "Erro!", description: "Não foi possível atualizar o status do pedido.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    }, []);
    
    const createOrder = useCallback(async (orderData: Partial<Order>) => {
        setIsSaving(true);
        try {
            await dataService.addOrder(orderData);
            toast({ title: "Sucesso!", description: "Novo pedido criado." });
            setIsCreateDialogOpen(false);
            loadData(); // Refresh all data
        } catch (error) {
            toast({ title: "Erro", description: "Não foi possível criar o pedido.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    }, [loadData]);
    
    return {
        isLoading,
        isSaving,
        // Data
        filteredOrders,
        allContacts,
        allProducts,
        settingsData,
        // Filters
        searchQuery,
        setSearchQuery,
        statusFilter,
        setStatusFilter,
        // Selection
        selectedOrder,
        setSelectedOrderId,
        // Dialogs
        isCreateDialogOpen,
        setIsCreateDialogOpen,
        // Mutations
        updateOrderStatus,
        createOrder,
        refresh: loadData,
    };
}