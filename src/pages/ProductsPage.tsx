import React, { useState, useCallback } from 'react';
import { Loader2, Package, BookOpen, Grid3x3 } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import ProductList from '../components/products/ProductList';
import ProductFilterBar from '../components/products/ProductFilterBar';
import ProductKanban from '../components/products/ProductKanban';
import TabLayout from '../components/ui/TabLayout';
import CatalogManagement from '../components/products/CatalogManagement';
import { Product } from '../types';
import ProductDrawer from '../components/products/ProductDrawer';
import ProductGallery from '../components/products/ProductGallery';
import AdvancedFilterPanel from '../components/products/AdvancedFilterPanel';

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

    const [activeProductTab, setActiveProductTab] = useState('list');

    const handleSelectProduct = useCallback((product: Product) => {
        setSelectedProductId(product.id);
        // Opcional: Abrir drawer ao selecionar na lista, se desejado
        // openDialog(product); 
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
        <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                 <div>
                    <h1 className="text-3xl font-bold text-textPrimary dark:text-dark-textPrimary flex items-center gap-3">
                        <Package className="h-8 w-8" />
                        Módulo de Produtos
                    </h1>
                    <p className="text-textSecondary dark:text-dark-textSecondary mt-1">
                        Gerencie catálogo, variações, preços e especificações técnicas.
                    </p>
                </div>
            </div>

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