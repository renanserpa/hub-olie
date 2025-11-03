import React, { useState } from 'react';
import { User } from '../types';
import { useOrders } from '../hooks/useOrders';
import OrderKanban from './OrderKanban';
import OrderDrawer from './OrderDrawer';
import OrderDialog from './OrderDialog';
import OrderFilters from './OrderFilters';
import { Loader2, PackageOpen } from 'lucide-react';
import OrdersTable from './orders/OrdersTable';
import OrderCard from './OrderCard';

type ViewMode = 'kanban' | 'list' | 'table';

const OrdersPage: React.FC<{ user: User }> = ({ user }) => {
    const [viewMode, setViewMode] = useState<ViewMode>('kanban');
    const {
        isLoading,
        isSaving,
        filteredOrders,
        allContacts,
        allProducts,
        searchQuery,
        setSearchQuery,
        selectedOrder,
        setSelectedOrderId,
        isCreateDialogOpen,
        setIsCreateDialogOpen,
        updateOrderStatus,
        createOrder,
        addItemToOrder,
        refresh,
    } = useOrders();

    if (isLoading && filteredOrders.length === 0) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-200px)]">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-primary" />
                    <p className="mt-4 text-lg font-semibold text-textSecondary">Carregando pedidos...</p>
                </div>
            </div>
        );
    }

    const renderContent = () => {
        if (filteredOrders.length === 0) {
            return (
                 <div className="text-center text-textSecondary py-16 border-2 border-dashed border-border rounded-xl">
                    <PackageOpen className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium text-textPrimary">Nenhum pedido encontrado</h3>
                    <p className="mt-1 text-sm">Nenhum pedido corresponde à sua busca.</p>
                </div>
            );
        }
        
        switch (viewMode) {
            case 'list':
                return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredOrders.map(order => (
                            <OrderCard key={order.id} order={order} onClick={() => setSelectedOrderId(order.id)} />
                        ))}
                    </div>
                );
            case 'table':
                return <OrdersTable orders={filteredOrders} onOrderSelect={setSelectedOrderId} />;
            case 'kanban':
            default:
                 return <OrderKanban 
                    orders={filteredOrders}
                    onCardClick={setSelectedOrderId}
                    onStatusChange={updateOrderStatus}
                />;
        }
    };
    
    return (
        <div>
            <OrderFilters 
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onNewOrderClick={() => setIsCreateDialogOpen(true)}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
            />
            
            {renderContent()}

            <OrderDrawer 
                order={selectedOrder}
                isOpen={!!selectedOrder}
                onClose={() => setSelectedOrderId(null)}
                allProducts={allProducts}
                addItemToOrder={addItemToOrder}
                isSaving={isSaving}
            />

            <OrderDialog
                isOpen={isCreateDialogOpen}
                onClose={() => setIsCreateDialogOpen(false)}
                onSave={refresh}
                contacts={allContacts}
                products={allProducts}
            />
        </div>
    );
};

export default OrdersPage;