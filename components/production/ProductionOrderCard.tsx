// [DEPRECATED] This file is obsolete. Add dummy export to resolve build errors.
import React from 'react';
// FIX: Import ProductionOrder to define props for the dummy component.
import { ProductionOrder } from '../../types';

// FIX: Add props interface to satisfy TypeScript during build, even though component is obsolete.
interface ProductionOrderCardProps {
    order: ProductionOrder;
    onClick: () => void;
    onDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
    onDragEnd: () => void;
}

const ProductionOrderCard: React.FC<ProductionOrderCardProps> = () => null;
export default ProductionOrderCard;
