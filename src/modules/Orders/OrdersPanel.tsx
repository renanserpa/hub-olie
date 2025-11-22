
import React from 'react';
import { useOrders } from '../../hooks/useOrders';
import OrderKanban from '../../components/OrderKanban';
import OrderDrawer from '../../components/OrderDrawer';
import OrderDialog from '../../components/OrderDialog';
import OrderFilters from '../../components/OrderFilters';
import { Loader2, PackageOpen } from 'lucide-react';
import OrdersTable from '../../components/orders/OrdersTable';
import OrderCard from '../../components/OrderCard';
import OrderKpiRow from '../../components/orders/OrderKpiRow';
import AdvancedFilterPanel from '../../components/orders/AdvancedFilterPanel';

type ViewMode = 'kanban' | 'list' | 'table';

const OrdersPanel: React.FC = () => {
    const {
        isLoading,
        isSaving,
        filteredOrders,
        allContacts,
        allProducts,
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
        kpis,
        isLoadingDetails,
    } = useOrders();

    const [viewMode, setViewMode] = React.useState<ViewMode>('kanban');

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
                    <p className="mt-1 text-sm">Nenhum pedido corresponde aos filtros aplicados.</p>
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
        <div className="space-y-6">
            <OrderFilters 
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onNewOrderClick={() => setIsCreateDialogOpen(true)}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                onAdvancedFilterClick={() => setIsFilterPanelOpen(true)}
            />

            <OrderKpiRow stats={kpis} />
            
            {renderContent()}

            <AdvancedFilterPanel
                isOpen={isFilterPanelOpen}
                onClose={() => setIsFilterPanelOpen(false)}
                filters={advancedFilters}
                onFiltersChange={setAdvancedFilters}
                contacts={allContacts}
                products={allProducts}
            />

            <OrderDrawer 
                order={selectedOrder}
                isOpen={!!selectedOrder}
                onClose={() => setSelectedOrderId(null)}
                allProducts={allProducts}
                addItemToOrder={addItemToOrder}
                isSaving={isSaving}
                isLoadingDetails={isLoadingDetails}
            />

            <OrderDialog
                isOpen={isCreateDialogOpen}
                onClose={() => setIsCreateDialogOpen(false)}
                onSave={createOrder}
                contacts={allContacts}
                products={allProducts}
            />
        </div>
    );
};

export default OrdersPanel;
