import React from 'react';
import { Loader2, Package, BookOpen } from 'lucide-react';
import { useProducts } from './hooks/useProducts';
import ProductList from './components/products/ProductList';
import ProductFilterBar from './components/products/ProductFilterBar';
import ProductKanban from './components/products/ProductKanban';
import TabLayout from './components/ui/TabLayout';
import CatalogManagement from './components/products/CatalogManagement';
import { Product } from './types';
import ProductDrawer from './components/products/ProductDrawer';

const PRODUCT_PAGE_TABS = [
    { id: 'list', label: 'Lista de Produtos', icon: Package },
    { id: 'settings', label: 'Dados Mestres', icon: BookOpen },
];

const ProductsPage: React.FC = () => {
    const {
        isLoading,
        isSaving,
        filteredProducts,
        allVariants,
        inventoryBalances,
        categories,
        settingsData,
        searchQuery,
        setSearchQuery,
        isDialogOpen,
        editingProduct,
        openDialog,
        closeDialog,
        saveProduct,
        viewMode,
        setViewMode,
        updateProductStatus,
        selectedProductId,
        setSelectedProductId,
        refresh,
    } = useProducts();

    const [activeProductTab, setActiveProductTab] = React.useState('list');

    const handleSelectProduct = React.useCallback((product: Product) => {
        setSelectedProductId(product.id);
        openDialog(product);
    }, [openDialog, setSelectedProductId]);

    const renderProductsContent = () => {
        if (isLoading) {
             return (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            );
        }
        if (viewMode === 'kanban') {
            return <ProductKanban 
                products={filteredProducts} 
                onCardClick={handleSelectProduct} 
                onStatusChange={updateProductStatus} 
                selectedProductId={selectedProductId}
                onEdit={openDialog}
            />;
        }
        return <ProductList 
            products={filteredProducts}
            allVariants={allVariants}
            isLoading={isLoading} 
            onEdit={openDialog} 
            selectedProductId={selectedProductId}
            onRowClick={(product) => handleSelectProduct(product)}
        />;
    };

    return (
        <div>
            <div className="mb-6">
                <TabLayout tabs={PRODUCT_PAGE_TABS} activeTab={activeProductTab} onTabChange={setActiveProductTab} />
            </div>

            {activeProductTab === 'list' && (
                <div>
                    <ProductFilterBar
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        onNewProductClick={() => openDialog()}
                        viewMode={viewMode}
                        onViewModeChange={setViewMode}
                    />
                    
                    <div className="mt-6">
                        {renderProductsContent()}
                    </div>
                </div>
            )}

            {activeProductTab === 'settings' && (
                <CatalogManagement />
            )}
            
            {isDialogOpen && settingsData && (
                <ProductDrawer
                    isOpen={isDialogOpen}
                    onClose={closeDialog}
                    onSave={saveProduct}
                    product={editingProduct}
                    categories={categories}
                    appData={settingsData}
                    allVariants={allVariants}
                    inventoryBalances={inventoryBalances}
                    onRefresh={refresh}
                />
            )}
            
            {isSaving && (
                 <div className="fixed inset-0 bg-black/20 z-50 flex justify-center items-center">
                    <Loader2 className="w-8 h-8 animate-spin text-white"/>
                </div>
            )}
        </div>
    );
};

export default ProductsPage;