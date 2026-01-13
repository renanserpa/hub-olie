import React from 'react';
import { Product } from '../../types';
import ProductGalleryCard from './ProductGalleryCard';
import { PackageOpen } from 'lucide-react';

interface ProductGalleryProps {
    products: Product[];
    onCardClick: (product: Product) => void;
}

const ProductGallery: React.FC<ProductGalleryProps> = ({ products, onCardClick }) => {
    if (products.length === 0) {
        return (
            <div className="text-center text-textSecondary py-16">
                <PackageOpen className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-textPrimary">Nenhum produto encontrado</h3>
                <p className="mt-1 text-sm">Nenhum produto corresponde aos filtros aplicados.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {products.map(product => (
                <ProductGalleryCard 
                    key={product.id}
                    product={product}
                    onClick={() => onCardClick(product)}
                />
            ))}
        </div>
    );
};

export default ProductGallery;
