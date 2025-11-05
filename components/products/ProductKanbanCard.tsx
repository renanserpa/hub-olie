import React from 'react';
import { Product } from '../../types';
import { GripVertical } from 'lucide-react';
import { Badge } from '../ui/Badge';

interface ProductKanbanCardProps {
    product: Product;
    onEdit: () => void;
}

const ProductKanbanCard: React.FC<ProductKanbanCardProps> = ({ product, onEdit }) => {
    
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        e.dataTransfer.setData('productId', product.id);
        e.currentTarget.style.opacity = '0.5';
        e.currentTarget.classList.add('shadow-lg', 'rotate-3');
    };
    
    const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
        e.currentTarget.style.opacity = '1';
        e.currentTarget.classList.remove('shadow-lg', 'rotate-3');
    };

    return (
        <div 
            draggable
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onClick={onEdit}
            className="p-3 rounded-lg shadow-sm border bg-card border-border cursor-grab active:cursor-grabbing hover:shadow-md hover:border-primary/50 transition-all duration-200"
        >
            <div className="flex items-start">
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-textPrimary truncate">{product.name}</p>
                    <p className="text-xs text-textSecondary truncate">{product.base_sku}</p>
                </div>
                <button className="text-textSecondary/50 hover:text-textSecondary">
                    <GripVertical size={18} />
                </button>
            </div>
            <div className="mt-2 flex justify-between items-center">
                <span className="text-sm font-bold text-primary">
                    {product.base_price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
                <Badge variant="secondary" className="text-xs">
                    {product.category}
                </Badge>
            </div>
        </div>
    );
};

export default ProductKanbanCard;