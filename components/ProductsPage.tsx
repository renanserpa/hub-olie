
import React from 'react';
import { User, AppData } from '../types';
import { Package, Plus, Search } from 'lucide-react';
import { Button } from './ui/Button';
import { useProducts } from '../hooks/useProducts';
import ProductList from './products/ProductList';
import ProductDialog from './products/ProductDialog';

interface ProductsPageProps {
  user: User;
  data: AppData;
  onDataChange: () => void;
}

const ProductsPage: React.FC<ProductsPageProps> = ({ user, data, onDataChange }) => {
    const {
        isLoading,
        filteredProducts,
        categories,
        searchQuery,
        setSearchQuery,
        isDialogOpen,
        editingProduct,
        openDialog,
        closeDialog,
        saveProduct,
    } = useProducts(data.products, data.product_categories, onDataChange);

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                 <div>
                    <h1 className="text-3xl font-bold text-textPrimary">Produtos</h1>
                    <p className="text-textSecondary mt-1">Gerencie seu catálogo de produtos e variações.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={() => openDialog()}><Plus className="w-4 h-4 mr-2" />Novo Produto</Button>
                </div>
            </div>
            
            <div className="mb-6">
                <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Search className="h-4 w-4 text-textSecondary" />
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar por nome ou SKU..."
                        className="w-full pl-9 pr-3 py-2 border border-border rounded-xl shadow-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                </div>
            </div>

            <ProductList 
                products={filteredProducts}
                isLoading={isLoading}
                onEdit={openDialog}
            />
            
            <ProductDialog
                isOpen={isDialogOpen}
                onClose={closeDialog}
                onSave={saveProduct}
                product={editingProduct}
                categories={categories}
                appData={data}
            />
        </div>
    );
};

export default ProductsPage;