

import React, { useState, useEffect, useCallback } from 'react';
import { supabaseService } from '../services/supabaseService';
import { Order, User, OrderStatus, Contact, Product } from '../types';
import { toast } from '../hooks/use-toast';
import { Plus, LayoutGrid, List, ShoppingCart, Loader2 } from 'lucide-react';
import { Button } from './ui/Button';
import { cn } from '../lib/utils';
import OrderKanban from './OrderKanban';
import OrderCard from './OrderCard';
import OrderDialog from './OrderDialog';
import OrderDetail from './OrderDetail';

const VIEW_MODE_KEY = 'orders_view_mode';

const ORDER_STATUS_TABS: { id: OrderStatus | 'all', label: string }[] = [
    { id: 'all', label: 'Todos' },
    { id: 'pending_payment', label: 'Aguardando Pagamento' },
    { id: 'paid', label: 'Pagos' },
    { id: 'in_production', label: 'Em Produção' },
    { id: 'awaiting_shipping', label: 'Pronto para Envio' },
];

const OrdersPage: React.FC<{ user: User }> = ({ user }) => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [pageData, setPageData] = useState<{ contacts: Contact[], products: Product[] }>({ contacts: [], products: [] });
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'list' | 'kanban'>(
        (localStorage.getItem(VIEW_MODE_KEY) as 'list' | 'kanban') || 'list'
    );
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [activeListTab, setActiveListTab] = useState<OrderStatus | 'all'>('all');

    const isAdmin = user?.role === 'AdminGeral';

    const loadPageData = useCallback(async () => {
        setLoading(true);
        try {
            const [contactsData, productsData, initialOrders] = await Promise.all([
                supabaseService.getContacts(),
                supabaseService.getProducts(),
                supabaseService.getOrders()
            ]);
            setPageData({ contacts: contactsData, products: productsData });
            setOrders(initialOrders);
        } catch (error) {
            toast({ title: 'Erro!', description: 'Não foi possível carregar os dados da página de pedidos.', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadPageData();
    }, [loadPageData]);
    
    // Listen for real-time order updates (optional, initial load is now more robust)
    useEffect(() => {
        const listener = supabaseService.listenToCollection<Order>('orders', '*, customers(*)', (newOrders) => {
            // This is a simple implementation. For production, you might want more sophisticated merging.
            loadPageData();
        });

        return () => {
            listener.unsubscribe();
        };
    }, [loadPageData]);


    useEffect(() => {
        localStorage.setItem(VIEW_MODE_KEY, viewMode);
    }, [viewMode]);

    const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
        try {
            // Optimistic update
            setOrders(prev => prev.map(o => o.id === orderId ? {...o, status: newStatus} : o));
            // FIX: Explicitly specify the generic type for updateDocument to ensure correct return type.
            const updatedOrder = await supabaseService.updateDocument<Order>('orders', orderId, { status: newStatus });
            toast({ title: 'Sucesso!', description: `Pedido #${updatedOrder.number.split('-')[1]} atualizado.` });
            // The listener will trigger a full reload, ensuring data consistency
        } catch (error) {
            toast({ title: 'Erro!', description: 'Não foi possível atualizar o status do pedido.', variant: 'destructive' });
            loadPageData(); // Revert optimistic update on error
        }
    };
    
    const handleSaveOrder = () => {
        setIsDialogOpen(false);
        // The real-time listener will pick up the change, no need for manual reload.
    };

    const filteredOrders = activeListTab === 'all'
        ? orders
        : orders.filter(order => order.status === activeListTab);

    if (selectedOrderId) {
        const selectedOrder = orders.find(o => o.id === selectedOrderId);
        return selectedOrder ? <OrderDetail order={selectedOrder} onClose={() => setSelectedOrderId(null)} onUpdate={loadPageData} /> : null;
    }

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                <div>
                    <div className="flex items-center gap-3">
                        <ShoppingCart className="text-primary" size={28}/>
                        <h1 className="text-3xl font-bold text-textPrimary">Pedidos</h1>
                    </div>
                    <p className="text-textSecondary mt-1">Gerencie o ciclo de vida completo dos seus pedidos.</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center p-1 rounded-lg bg-secondary">
                        <Button variant={viewMode === 'list' ? 'primary' : 'ghost'} size="sm" onClick={() => setViewMode('list')} className="h-8 w-8 p-0"><List size={16} /></Button>
                        <Button variant={viewMode === 'kanban' ? 'primary' : 'ghost'} size="sm" onClick={() => setViewMode('kanban')} className="h-8 w-8 p-0"><LayoutGrid size={16} /></Button>
                    </div>
                    <Button onClick={() => setIsDialogOpen(true)}><Plus className="w-4 h-4 mr-2" />Novo Pedido</Button>
                </div>
            </div>

            {loading ? (
                 <div className="text-center py-10 flex items-center justify-center gap-2 text-textSecondary">
                    <Loader2 className="h-5 w-5 animate-spin"/> Carregando pedidos...
                </div>
            ) : viewMode === 'kanban' ? (
                <OrderKanban orders={orders} onStatusChange={handleStatusChange} onCardClick={setSelectedOrderId} />
            ) : (
                <div>
                    <div className="border-b border-border mb-4">
                        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                            {ORDER_STATUS_TABS.map(tab => (
                                <button key={tab.id} onClick={() => setActiveListTab(tab.id)}
                                    className={cn(
                                        'whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-sm focus:outline-none',
                                        activeListTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-textSecondary hover:text-textPrimary'
                                    )}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>
                    <div className="space-y-4">
                        {filteredOrders.map(order => (
                            <OrderCard key={order.id} order={order} onClick={() => setSelectedOrderId(order.id)} />
                        ))}
                    </div>
                </div>
            )}

            <OrderDialog 
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                onSave={handleSaveOrder}
                contacts={pageData.contacts}
                products={pageData.products}
            />
        </div>
    );
};

export default OrdersPage;