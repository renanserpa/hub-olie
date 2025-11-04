import React from 'react';
import { ProductionOrder } from '../../types';
import ProductionOrderCard from './ProductionOrderCard';
import { PackageOpen } from 'lucide-react';

interface ProductionOrderListProps {
    orders: ProductionOrder[];
    onOrderClick: (id: string) => void;
}

const ProductionOrderList: React.FC<ProductionOrderListProps> = ({ orders, onOrderClick }) => {
    if (orders.length === 0) {
        return (
            <div className="text-center text-textSecondary py-16 border-2 border-dashed border-border rounded-xl">
                <PackageOpen className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-textPrimary">Nenhuma Ordem de Produção</h3>
                <p className="mt-1 text-sm text-textSecondary">Nenhuma OP corresponde aos filtros selecionados.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {orders.map(order => (
                <ProductionOrderCard
                    key={order.id}
                    order={order}
                    onClick={() => onOrderClick(order.id)}
                />
            ))}
        </div>
    );
};

export default ProductionOrderList;