import React from 'react';
import { Loader2, Package, BookOpen } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import ProductList from './products/ProductList';
import ProductDialog from './products/ProductDialog';
import ProductFilterBar from './products/ProductFilterBar';
import ProductKanban from './products/ProductKanban';
import TabLayout from './ui/TabLayout';
import CatalogManagement from './products/CatalogManagement';

const PRODUCT_PAGE_TABS = [
    { id: 'products', label: 'Produtos', icon: Package },
    { id: 'catalog', label: 'Dados Mestres (Catálogo)', icon: BookOpen },
];


const ProductsPage: React.FC = () => {
    const {
        isLoading,
        isSaving,
        filteredProducts,
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
    } = useProducts();

    const [activeProductTab, setActiveProductTab] = React.useState('products');

    const renderProductsContent = () => {
        if (isLoading) {
             return (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            );
        }
        if (viewMode === 'kanban') {
            return <ProductKanban products={filteredProducts} onCardClick={openDialog} onStatusChange={updateProductStatus} />;
        }
        return <ProductList products={filteredProducts} isLoading={isLoading} onEdit={openDialog} />;
    };

    return (
        <div>
            <div className="mb-6">
                <TabLayout tabs={PRODUCT_PAGE_TABS} activeTab={activeProductTab} onTabChange={setActiveProductTab} />
            </div>

            {activeProductTab === 'products' && (
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

            {activeProductTab === 'catalog' && (
                <CatalogManagement />
            )}
            
            {isDialogOpen && settingsData && (
                <ProductDialog
                    isOpen={isDialogOpen}
                    onClose={closeDialog}
                    onSave={saveProduct}
                    product={editingProduct}
                    categories={categories}
                    appData={settingsData}
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
