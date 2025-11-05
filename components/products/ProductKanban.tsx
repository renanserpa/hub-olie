import React, { useState } from 'react';
import { Product, ProductStatus } from '../../types';
import { cn } from '../../lib/utils';
import ProductKanbanCard from './ProductKanbanCard';

interface ProductKanbanProps {
  products: Product[];
  onCardClick: (product: Product) => void;
  onStatusChange: (productId: string, newStatus: ProductStatus) => void;
  selectedProductId: string | null;
  onEdit: (product: Product) => void;
}

const PRODUCT_COLUMNS: { id: ProductStatus, label: string }[] = [
  { id: 'Rascunho', label: 'Rascunho' },
  { id: 'Homologado Qualidade', label: 'Homologado' },
  { id: 'Ativo', label: 'Ativo' },
  { id: 'Suspenso', label: 'Suspenso' },
  { id: 'Descontinuado', label: 'Descontinuado' },
];

const ProductKanban: React.FC<ProductKanbanProps> = ({ products, onCardClick, onStatusChange, selectedProductId, onEdit }) => {
    const [isDraggingOver, setIsDraggingOver] = useState<ProductStatus | null>(null);

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>, status: ProductStatus) => {
        e.preventDefault();
        setIsDraggingOver(status);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDraggingOver(null);
    }
    
    const handleDrop = (e: React.DragEvent<HTMLDivElement>, newStatus: ProductStatus) => {
        e.preventDefault();
        setIsDraggingOver(null);
        const productId = e.dataTransfer.getData('productId');
        if (productId) {
            const product = products.find(p => p.id === productId);
            if (product && product.status !== newStatus) {
                onStatusChange(productId, newStatus);
            }
        }
    };

    return (
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 sm:-mx-6 px-4 sm:-mx-6">
            {PRODUCT_COLUMNS.map(column => (
                <div 
                    key={column.id}
                    onDragOver={(e) => handleDragOver(e, column.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, column.id)}
                    className={cn(
                        "w-72 md:w-80 flex-shrink-0 bg-secondary dark:bg-dark-secondary p-3 rounded-xl transition-colors duration-200",
                        isDraggingOver === column.id && "bg-primary/10"
                    )}
                >
                    <div className="flex justify-between items-center mb-4 px-1">
                        <h3 className="font-semibold text-sm text-textPrimary dark:text-dark-textPrimary">{column.label}</h3>
                        <span className="text-xs font-medium text-textSecondary dark:text-dark-textSecondary bg-background dark:bg-dark-background px-2 py-1 rounded-full">
                            {products.filter(p => p.status === column.id).length}
                        </span>
                    </div>
                    <div className="space-y-3 min-h-[200px]">
                        {products
                            .filter(product => product.status === column.id)
                            .map(product => (
                                <ProductKanbanCard
                                    key={product.id} 
                                    product={product} 
                                    onClick={() => onCardClick(product)}
                                    onEdit={() => onEdit(product)}
                                    isSelected={product.id === selectedProductId}
                                />
                            ))
                        }
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ProductKanban;