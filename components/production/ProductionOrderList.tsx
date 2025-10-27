import React from 'react';
import { ProductionOrder } from '../../types';
import ProductionOrderCard from './ProductionOrderCard';
import { PackageOpen } from 'lucide-react';
import { Card } from '../ui/Card';

interface ProductionOrderListProps {
    orders: ProductionOrder[];
    isLoading: boolean;
    selectedOrderId: string | null;
    onSelectOrder: (id: string) => void;
}

const SkeletonCard: React.FC = () => (
    <Card className="p-4 animate-pulse">
        <div className="flex justify-between items-start">
            <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-3 bg-gray-200 rounded w-32"></div>
            </div>
            <div className="h-5 bg-gray-200 rounded-full w-20"></div>
        </div>
        <div className="mt-4 space-y-2">
            <div className="h-3 bg-gray-200 rounded w-full"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
        </div>
        <div className="mt-4 h-2 bg-gray-200 rounded-full"></div>
    </Card>
);

const ProductionOrderList: React.FC<ProductionOrderListProps> = ({ orders, isLoading, selectedOrderId, onSelectOrder }) => {
    if (isLoading) {
        return (
            <div className="space-y-3">
                {[...Array(5)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
        );
    }
    
    if (orders.length === 0) {
        return (
            <div className="text-center text-textSecondary py-16 border-2 border-dashed border-border rounded-xl h-full">
                <PackageOpen className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-textPrimary">Nenhuma Ordem de Produção</h3>
                <p className="mt-1 text-sm text-textSecondary">Nenhuma OP corresponde aos filtros selecionados.</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {orders.map(order => (
                <ProductionOrderCard
                    key={order.id}
                    order={order}
                    isSelected={order.id === selectedOrderId}
                    onClick={() => onSelectOrder(order.id)}
                />
            ))}
        </div>
    );
};

export default ProductionOrderList;
