
import React from 'react';
import { Product } from '../../types';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { PackageOpen, Edit } from 'lucide-react';
import { Badge } from '../ui/Badge';

interface ProductListProps {
    products: Product[];
    isLoading: boolean;
    onEdit: (product: Product) => void;
}

const SkeletonRow: React.FC = () => (
    <tr className="animate-pulse">
        <td className="p-4"><div className="h-4 bg-gray-200 rounded w-3/4"></div></td>
        <td className="p-4"><div className="h-4 bg-gray-200 rounded w-1/2"></div></td>
        <td className="p-4"><div className="h-4 bg-gray-200 rounded w-1/4"></div></td>
        <td className="p-4"><div className="h-4 bg-gray-200 rounded w-1/4"></div></td>
        <td className="p-4"><div className="h-4 bg-gray-200 rounded w-1/4"></div></td>
        <td className="p-4"><div className="h-8 bg-gray-200 rounded w-20"></div></td>
    </tr>
);

const ProductList: React.FC<ProductListProps> = ({ products, isLoading, onEdit }) => {
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
                        <p className="mt-1 text-sm">Crie o primeiro produto para começar a gerenciar seu catálogo.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-secondary">
                                <tr>
                                    <th className="p-4 font-semibold text-textSecondary">Nome</th>
                                    <th className="p-4 font-semibold text-textSecondary">SKU</th>
                                    <th className="p-4 font-semibold text-textSecondary">Categoria</th>
                                    <th className="p-4 font-semibold text-textSecondary">Preço Base</th>
                                    <th className="p-4 font-semibold text-textSecondary">Estoque</th>
                                    <th className="p-4 font-semibold text-textSecondary text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map(product => (
                                    <tr key={product.id} className="border-b border-border hover:bg-accent/50">
                                        <td className="p-4 font-medium text-textPrimary">{product.name}</td>
                                        <td className="p-4 font-mono text-xs">{product.sku}</td>
                                        <td className="p-4"><Badge variant="secondary">{product.category?.name || 'N/A'}</Badge></td>
                                        <td className="p-4">R$ {product.basePrice.toFixed(2)}</td>
                                        <td className="p-4">{product.stock_quantity}</td>
                                        <td className="p-4 text-right">
                                            <Button variant="ghost" size="sm" onClick={() => onEdit(product)}>
                                                <Edit size={14} className="mr-2" />
                                                Editar
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default ProductList;
