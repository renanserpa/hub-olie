
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Order, Contact, Product, OrderStatus, AppData as _AppData, OrderItem, LogisticsShipment } from '../types';
import { dataService } from '../services/dataService';
import { toast } from './use-toast';

export interface AdvancedFilters {
    startDate: string;
    endDate: string;
    customerIds: string[];
    status: OrderStatus[];
    minValue: number | '';
    maxValue: number | '';
    productId: string;
}

export function useOrders() {
    const [allOrders, setAllOrders] = useState<Order[]>([]);
    const [allContacts, setAllContacts] = useState<Contact[]>([]);
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [_settingsData, setSettingsData] = useState<_AppData | null>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    const [searchQuery, setSearchQuery] = useState('');
    const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({
        startDate: '', endDate: '', customerIds: [], status: [], minValue: '', maxValue: '', productId: '',
    });
    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [detailedOrder, setDetailedOrder] = useState<Order | null>(null);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
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

        const ordersListener = dataService.listenToCollection('orders', '*, customers(*)', undefined, () => {
            loadData();
        });
        const itemsListener = dataService.listenToCollection('order_items', undefined, undefined, () => {
            loadData(); 
        });

        return () => {
            ordersListener.unsubscribe();
            itemsListener.unsubscribe();
        };
    }, [loadData]);

     useEffect(() => {
        const fetchDetails = async () => {
            if (!selectedOrderId) {
                setDetailedOrder(null);
                return;
            }
            setIsLoadingDetails(true);
            try {
                const details = await dataService.getOrder(selectedOrderId);
                setDetailedOrder(details);
            } catch (error) {
                toast({ title: "Erro!", description: "Não foi possível carregar os detalhes do pedido.", variant: "destructive" });
            } finally {
                setIsLoadingDetails(false);
            }
        };
        fetchDetails();
    }, [selectedOrderId]);

    const filteredOrders = useMemo(() => {
        return allOrders.filter(order => {
            const searchMatch = searchQuery.length === 0 ||
                order.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (order.customers?.name && order.customers.name.toLowerCase().includes(searchQuery.toLowerCase()));

            const startDateMatch = !advancedFilters.startDate || new Date(order.created_at) >= new Date(advancedFilters.startDate);
            const endDateMatch = !advancedFilters.endDate || new Date(order.created_at) <= new Date(advancedFilters.endDate);
            const customerMatch = advancedFilters.customerIds.length === 0 || advancedFilters.customerIds.includes(order.customer_id);
            const statusMatch = advancedFilters.status.length === 0 || advancedFilters.status.includes(order.status);
            const minValueMatch = advancedFilters.minValue === '' || order.total >= advancedFilters.minValue;
            const maxValueMatch = advancedFilters.maxValue === '' || order.total <= advancedFilters.maxValue;
            const productMatch = !advancedFilters.productId || order.items.some(item => item.product_id === advancedFilters.productId);

            return searchMatch && startDateMatch && endDateMatch && customerMatch && statusMatch && minValueMatch && maxValueMatch && productMatch;
        });
    }, [allOrders, searchQuery, advancedFilters]);
    
    const selectedOrder = useMemo(() => {
        if (!selectedOrderId) return null;
        if (detailedOrder && detailedOrder.id === selectedOrderId) {
            return detailedOrder;
        }
        return allOrders.find(o => o.id === selectedOrderId) || null;
    }, [selectedOrderId, detailedOrder, allOrders]);

    const kpis = useMemo(() => {
        if (!allOrders) {
            return { pending: 0, paid: 0, inProduction: 0, awaitingShipping: 0 };
        }
        return {
            pending: allOrders.filter(o => o.status === 'pending_payment').length,
            paid: allOrders.filter(o => o.status === 'paid').length,
            inProduction: allOrders.filter(o => o.status === 'in_production').length,
            awaitingShipping: allOrders.filter(o => o.status === 'awaiting_shipping').length
        };
    }, [allOrders]);

    const updateOrderStatus = useCallback(async (orderId: string, newStatus: OrderStatus) => {
        setIsSaving(true);
        try {
            await dataService.updateOrderStatus(orderId, newStatus);
            toast({ title: "Status Atualizado!", description: `O pedido foi movido para "${newStatus}".`});

            if (newStatus === 'awaiting_shipping') {
                const order = allOrders.find(o => o.id === orderId);
                if (order && order.customers) {
                    const newShipment: Omit<LogisticsShipment, 'id' | 'tracking_code'> = {
                        order_id: order.id,
                        order_number: order.number,
                        customer_name: order.customers.name,
                        status: 'pending',
                        created_at: new Date().toISOString(),
                    };
                    await dataService.addDocument('logistics_shipments', newShipment);
                    toast({ title: "Integração Logística", description: `Envio para o pedido ${order.number} criado na expedição.` });
                }
            }
        } catch (error) {
            toast({ title: "Erro!", description: "Não foi possível atualizar o status do pedido.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    }, [allOrders]);
    
    const createOrder = useCallback(async (orderData: Partial<Order>) => {
        setIsSaving(true);
        try {
            await dataService.addOrder(orderData);
            toast({ title: "Sucesso!", description: "Novo pedido criado." });
            setIsCreateDialogOpen(false);
        } catch (error) {
            toast({ title: "Erro", description: "Não foi possível criar o pedido.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    }, []);

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
    
            await dataService.addDocument('order_items', newItem);
            
            toast({ title: "Sucesso!", description: "Item adicionado ao pedido." });
        } catch (error) {
            toast({ title: "Erro", description: "Não foi possível adicionar o item.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    }, [allProducts]);
    
    return {
        isLoading,
        isSaving,
        filteredOrders,
        allContacts,
        allProducts,
        kpis,
        searchQuery,
        setSearchQuery,
        advancedFilters,
        setAdvancedFilters,
        isFilterPanelOpen,
        setIsFilterPanelOpen,
        selectedOrder,
        setSelectedOrderId,
        isCreateDialogOpen,
        setIsCreateDialogOpen,
        updateOrderStatus,
        createOrder,
        addItemToOrder,
        refresh: loadData,
        isLoadingDetails,
    };
}
