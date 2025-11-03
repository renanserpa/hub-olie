import React from 'react';
import { Loader2 } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import ProductList from './products/ProductList';
import ProductDialog from './products/ProductDialog';
import ProductFilterBar from './products/ProductFilterBar';
import ProductKanban from './products/ProductKanban';

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

    const renderContent = () => {
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
            <ProductFilterBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onNewProductClick={() => openDialog()}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
            />
            
            <div className="mt-6">
                {renderContent()}
            </div>
            
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