import React from 'react';
import { Product } from '../../types';
import { Badge } from '../ui/Badge';
import { cn } from '../../lib/utils';

interface ProductGalleryCardProps {
    product: Product;
    onClick: () => void;
}

const ProductGalleryCard: React.FC<ProductGalleryCardProps> = ({ product, onClick }) => {
    const primaryImage = product.images && product.images.length > 0 ? product.images[0] : `https://via.placeholder.com/400x400.png/F8F6F2/D2A66D?text=${product.name.charAt(0)}`;

    return (
        <div 
            onClick={onClick}
            className="group cursor-pointer bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
        >
            <div className="aspect-square w-full bg-secondary overflow-hidden">
                <img 
                    src={primaryImage} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
            </div>
            <div className="p-3">
                <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-sm leading-tight text-textPrimary pr-2">{product.name}</h3>
                    <Badge variant={product.status === 'Ativo' ? 'ativo' : 'inativo'} className="text-[10px] flex-shrink-0">{product.status}</Badge>
                </div>
                <p className="text-xs text-textSecondary font-mono mt-1">{product.base_sku}</p>
                <p className="font-bold text-primary mt-2">
                    {product.base_price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
            </div>
        </div>
    );
};

export default ProductGalleryCard;
