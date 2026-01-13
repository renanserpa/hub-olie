import React from 'react';
import { Loader2, Package, BookOpen } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import ProductList from './products/ProductList';
import ProductFilterBar from './products/ProductFilterBar';
import ProductKanban from './products/ProductKanban';
import TabLayout from './ui/TabLayout';
import CatalogManagement from './products/CatalogManagement';
import { Product } from '../types';
import ProductDrawer from './products/ProductDrawer';
import ProductGallery from './products/ProductGallery';
import AdvancedFilterPanel from './products/AdvancedFilterPanel';

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
        collections,
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
        generateVariantsForProduct,
        advancedFilters,
        setAdvancedFilters,
        isAdvancedFilterOpen,
        setIsAdvancedFilterOpen,
        clearFilters,
        visibleColumns,
        toggleColumnVisibility,
    } = useProducts();

    const [activeProductTab, setActiveProductTab] = React.useState('list');

    const handleSelectProduct = React.useCallback((product: Product) => {
        setSelectedProductId(product.id);
    }, [setSelectedProductId]);

     const handleOpenDrawer = (product: Product) => {
        setSelectedProductId(product.id);
        openDialog(product);
    };


    const renderProductsContent = () => {
        if (isLoading && filteredProducts.length === 0) {
             return (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            );
        }
        switch (viewMode) {
            case 'kanban':
                return <ProductKanban 
                    products={filteredProducts} 
                    onCardClick={handleOpenDrawer} 
                    onStatusChange={updateProductStatus} 
                    selectedProductId={selectedProductId}
                    onEdit={handleOpenDrawer}
                />;
             case 'gallery':
                return <ProductGallery 
                    products={filteredProducts} 
                    onCardClick={handleOpenDrawer} 
                />;
            case 'list':
            default:
                return <ProductList 
                    products={filteredProducts}
                    allVariants={allVariants}
                    isLoading={isLoading} 
                    onEdit={handleOpenDrawer} 
                    selectedProductId={selectedProductId}
                    onRowClick={handleSelectProduct}
                    visibleColumns={visibleColumns}
                />;
        }
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
                        onAdvancedFilterClick={() => setIsAdvancedFilterOpen(true)}
                        visibleColumns={visibleColumns}
                        toggleColumnVisibility={toggleColumnVisibility}
                        isLoading={isLoading}
                    />
                    
                    <div className="mt-6">
                        {renderProductsContent()}
                    </div>
                </div>
            )}

            {activeProductTab === 'settings' && (
                <CatalogManagement />
            )}
            
            {settingsData && (
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
                    isSaving={isSaving}
                    generateVariantsForProduct={generateVariantsForProduct}
                />
            )}
            
             <AdvancedFilterPanel
                isOpen={isAdvancedFilterOpen}
                onClose={() => setIsAdvancedFilterOpen(false)}
                filters={advancedFilters}
                onFiltersChange={setAdvancedFilters}
                onClearFilters={clearFilters}
                categories={categories}
                collections={collections}
            />
            
            {isSaving && (
                 <div className="fixed inset-0 bg-black/20 z-50 flex justify-center items-center">
                    <Loader2 className="w-8 h-8 animate-spin text-white"/>
                </div>
            )}
        </div>
    );
};

export default ProductsPage;
