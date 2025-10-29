import React from 'react';
import { User } from '../types';
import { useOrders } from '../hooks/useOrders';
import OrderKanban from './OrderKanban';
import OrderDrawer from './OrderDrawer';
import OrderDialog from './OrderDialog';
import OrderFilters from './OrderFilters';
import { Loader2 } from 'lucide-react';

const OrdersPage: React.FC<{ user: User }> = ({ user }) => {
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
    
    return (
        <div>
            <OrderFilters 
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onNewOrderClick={() => setIsCreateDialogOpen(true)}
            />
            
            <OrderKanban 
                orders={filteredOrders}
                onCardClick={setSelectedOrderId}
                onStatusChange={updateOrderStatus}
            />

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
