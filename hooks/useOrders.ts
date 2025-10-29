import { useState, useEffect, useMemo, useCallback } from 'react';
import { Order, Contact, Product, OrderStatus, AppData, OrderItem } from '../types';
import { dataService } from '../services/dataService';
import { toast } from './use-toast';

export function useOrders() {
    const [allOrders, setAllOrders] = useState<Order[]>([]);
    const [allContacts, setAllContacts] = useState<Contact[]>([]);
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    // FIX: Initial state for settingsData should be `null` to match the type `AppData | null`.
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

    const addItemToOrder = useCallback(async (orderId: string, itemData: { product_id: string; quantity: number }) => {
        setIsSaving(true);
        try {
            const product = allProducts.find(p => p.id === itemData.product_id);
            if (!product) {
                toast({ title: "Erro", description: "Produto não encontrado.", variant: "destructive" });
                return;
            }
    
            const newItem: Omit<OrderItem, 'id'> = {
                order_id: orderId,
                product_id: itemData.product_id,
                product_name: product.name,
                quantity: itemData.quantity,
                unit_price: product.base_price,
                total: product.base_price * itemData.quantity,
            };
    
            const addedItem = await dataService.addDocument('order_items', newItem);
    
            const order = allOrders.find(o => o.id === orderId);
            if (order) {
                const updatedItems = [...order.items, addedItem as OrderItem];
                const newSubtotal = updatedItems.reduce((sum, item) => sum + item.total, 0);
                const newTotal = newSubtotal - order.discounts + order.shipping_fee;
    
                // FIX: Explicitly provide the generic type for updateDocument to ensure correct type checking.
                await dataService.updateDocument<Order>('orders', orderId, {
                    subtotal: newSubtotal,
                    total: newTotal,
                });
            }
            
            toast({ title: "Sucesso!", description: "Item adicionado ao pedido." });
            await loadData();
    
        } catch (error) {
            toast({ title: "Erro", description: "Não foi possível adicionar o item.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    }, [allProducts, allOrders, loadData]);
    
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
        addItemToOrder,
        refresh: loadData,
    };
}