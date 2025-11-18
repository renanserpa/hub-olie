
import React, { useState } from 'react';
import { useProducts } from '../hooks/useProducts';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Loader2, Package, Plus, RefreshCw } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import ProductForm from '../components/Products/ProductForm';
import { Product } from '../types';

const ProductsPage: React.FC = () => {
  const { products, loading, refetchProducts } = useProducts();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  const getMinPrice = (variants: any[]) => {
    if (!variants || variants.length === 0) return 0;
    return Math.min(...variants.map(v => v.sales_price));
  };

  const handleCreate = () => {
    setProductToEdit(null);
    setIsDrawerOpen(true);
  };

  const handleEdit = (product: Product) => {
    setProductToEdit(product);
    setIsDrawerOpen(true);
  };

  const handleClose = () => {
    setIsDrawerOpen(false);
    setProductToEdit(null);
  };

  const handleSuccess = () => {
      refetchProducts();
      handleClose();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-textPrimary flex items-center gap-3">
            <Package className="h-8 w-8" />
            Catálogo de Produtos
          </h1>
          <p className="text-textSecondary mt-1">Gerencie seus produtos e variações.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refetchProducts} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Produto
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Produtos</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-border rounded-xl">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-textPrimary">Nenhum produto encontrado</h3>
              <p className="mt-1 text-sm text-textSecondary">Comece adicionando seu primeiro produto ao catálogo.</p>
              <Button className="mt-6" onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Produto
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-secondary text-textSecondary font-semibold">
                  <tr>
                    <th className="p-4 rounded-tl-lg">Nome do Produto</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-center">Variações</th>
                    <th className="p-4 text-right rounded-tr-lg">Preço (a partir de)</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr 
                        key={product.id} 
                        className="border-b border-border hover:bg-accent/50 transition-colors cursor-pointer"
                        onClick={() => handleEdit(product)}
                    >
                      <td className="p-4 font-medium text-textPrimary">
                        {product.name}
                        {product.description && (
                          <p className="text-xs text-textSecondary truncate max-w-xs font-normal">
                            {product.description}
                          </p>
                        )}
                      </td>
                      <td className="p-4">
                        <Badge variant={product.status === 'Ativo' ? 'ativo' : 'secondary'}>
                          {product.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-center">
                        {product.product_variants?.length || 0}
                      </td>
                      <td className="p-4 text-right font-mono">
                        {product.product_variants && product.product_variants.length > 0
                          ? getMinPrice(product.product_variants).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Modal 
        isOpen={isDrawerOpen} 
        onClose={handleClose} 
        title={productToEdit ? 'Editar Produto' : 'Novo Produto'}
        className="max-w-lg"
      >
          <ProductForm 
            productToEdit={productToEdit} 
            onSuccess={handleSuccess}
            onCancel={handleClose}
          />
      </Modal>
    </div>
  );
};

export default ProductsPage;
