import React, { useState, useEffect, useCallback } from 'react';
import { firebaseService } from '../services/firestoreService';
import { Order, User, OrderStatus, AppData, Contact, Product } from '../types';
import { toast } from '../hooks/use-toast';
import { Plus, LayoutGrid, List, ShoppingCart } from 'lucide-react';
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
            const [ordersData, contactsData, productsData] = await Promise.all([
                firebaseService.getOrders(),
                firebaseService.getCollection<Contact>('contacts'),
                firebaseService.getProducts()
            ]);
            setOrders(ordersData);
            setPageData({ contacts: contactsData, products: productsData });
        } catch (error) {
            toast({ title: 'Erro!', description: 'Não foi possível carregar os dados da página.', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadPageData();
    }, [loadPageData]);

    useEffect(() => {
        localStorage.setItem(VIEW_MODE_KEY, viewMode);
    }, [viewMode]);

    const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
        try {
            const updatedOrder = await firebaseService.updateOrderStatus(orderId, newStatus);
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: updatedOrder.status, updated_at: updatedOrder.updated_at } : o));
            toast({ title: 'Sucesso!', description: `Pedido #${updatedOrder.order_number.split('-')[1]} atualizado para ${newStatus}.` });
        } catch (error) {
            toast({ title: 'Erro!', description: 'Não foi possível atualizar o status do pedido.', variant: 'destructive' });
        }
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
                 <div className="text-center py-10">
                    <div className="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-primary mx-auto"></div>
                    <p className="mt-4 text-sm font-semibold text-textSecondary">Carregando pedidos...</p>
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
                onSave={() => {
                    setIsDialogOpen(false);
                    loadPageData();
                }}
                contacts={pageData.contacts}
                products={pageData.products}
            />
        </div>
    );
};

export default OrdersPage;