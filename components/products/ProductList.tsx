import React from 'react';
import { Product, ProductVariant, Collection } from '../../types';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { PackageOpen, Edit } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { cn } from '../../lib/utils';
import { ProductColumn } from '../../hooks/useProducts';

interface ProductListProps {
    products: (Product & { collections?: Collection[] })[];
    allVariants: ProductVariant[];
    isLoading: boolean;
    onEdit: (product: Product) => void;
    selectedProductId: string | null;
    onRowClick: (product: Product) => void;
    visibleColumns: Set<ProductColumn>;
}

const SkeletonRow: React.FC = () => (
    <tr className="animate-pulse">
        <td className="p-4"><div className="h-4 bg-gray-200 rounded w-1/2"></div></td>
        <td className="p-4"><div className="h-4 bg-gray-200 rounded w-3/4"></div></td>
        <td className="p-4"><div className="h-4 bg-gray-200 rounded w-1/4"></div></td>
        <td className="p-4"><div className="h-4 bg-gray-200 rounded w-1/4"></div></td>
        <td className="p-4"><div className="h-8 bg-gray-200 rounded w-20"></div></td>
    </tr>
);

const ProductList: React.FC<ProductListProps> = ({ products, allVariants, isLoading, onEdit, selectedProductId, onRowClick, visibleColumns }) => {
    return (
        <Card>
            <CardContent className="p-0">
                 {isLoading ? (
                    <table className="w-full">
                        <tbody>
                            {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
                        </tbody>
                    </table>
                ) : products.length === 0 ? (
                    <div className="text-center text-textSecondary py-16">
                        <PackageOpen className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-4 text-lg font-medium text-textPrimary">Nenhum produto encontrado</h3>
                        <p className="mt-1 text-sm">Nenhum produto corresponde aos filtros aplicados.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-secondary">
                                <tr>
                                    <th className="p-4 font-semibold text-textSecondary">SKU</th>
                                    <th className="p-4 font-semibold text-textSecondary">Nome do Produto</th>
                                    {visibleColumns.has('category') && <th className="p-4 font-semibold text-textSecondary">Categoria</th>}
                                    {visibleColumns.has('collection_ids') && <th className="p-4 font-semibold text-textSecondary">Coleção</th>}
                                    {visibleColumns.has('available_sizes') && <th className="p-4 font-semibold text-textSecondary">Tamanhos</th>}
                                    {visibleColumns.has('variants') && <th className="p-4 font-semibold text-textSecondary">Variantes</th>}
                                    {visibleColumns.has('status') && <th className="p-4 font-semibold text-textSecondary">Status</th>}
                                    <th className="p-4 font-semibold text-textSecondary text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map(product => {
                                    const variantCount = allVariants.filter(v => v.product_base_id === product.id).length;
                                    const availableSizes = product.available_sizes?.map(s => s.name).join(', ') || 'N/A';
                                    return (
                                        <tr 
                                            key={product.id} 
                                            onClick={() => onRowClick(product)}
                                            className={cn(
                                                "border-b border-border cursor-pointer",
                                                selectedProductId === product.id ? 'bg-accent dark:bg-dark-accent' : 'hover:bg-accent/50 dark:hover:bg-dark-accent/50'
                                            )}
                                        >
                                            <td className="p-4 font-mono text-xs">{product.base_sku}</td>
                                            <td className="p-4 font-medium text-textPrimary">{product.name}</td>
                                            {visibleColumns.has('category') && <td className="p-4"><Badge variant="secondary">{product.category || 'N/A'}</Badge></td>}
                                            {visibleColumns.has('collection_ids') && <td className="p-4 text-xs">{(product.collections || []).map(c => c.name).join(', ') || 'N/A'}</td>}
                                            {visibleColumns.has('available_sizes') && <td className="p-4 text-xs">{availableSizes}</td>}
                                            {visibleColumns.has('variants') && <td className="p-4 text-xs">{variantCount}</td>}
                                            {visibleColumns.has('status') && <td className="p-4"><Badge variant={product.status === 'Ativo' ? 'ativo' : 'inativo'}>{product.status}</Badge></td>}
                                            <td className="p-4 text-right">
                                                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onEdit(product); }}>
                                                    <Edit size={14} className="mr-2" />
                                                    Detalhes
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default ProductList;
