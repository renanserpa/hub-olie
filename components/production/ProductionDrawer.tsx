import React from 'react';
import { ProductionOrder, Material, ProductionTaskStatus, ProductionQualityCheck } from '../../types';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import ProductionOrderDetailPanel from './ProductionOrderDetailPanel';


interface ProductionDrawerProps {
    order: ProductionOrder | null;
    isOpen: boolean;
    onClose: () => void;
    allMaterials: Material[];
    onUpdateTaskStatus: (taskId: string, status: ProductionTaskStatus) => void;
    onCreateQualityCheck: (check: Omit<ProductionQualityCheck, 'id' | 'created_at'>) => void;
}

const ProductionDrawer: React.FC<ProductionDrawerProps> = (props) => {
    const { order, isOpen, onClose } = props;
    
    if (!order) return null;

    return (
        <div 
            className={cn(
                "fixed inset-0 bg-black/60 z-40 transition-opacity",
                isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
            onClick={onClose}
        >
            <div 
                className={cn(
                    "fixed top-0 right-0 h-full w-full max-w-lg bg-card shadow-lg flex flex-col transition-transform duration-300",
                    isOpen ? "translate-x-0" : "translate-x-full"
                )}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-border flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-textPrimary">Ordem de Produção {order.po_number}</h2>
                        <p className="text-sm text-textSecondary">{order.product?.name}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose}><X /></Button>
                </div>
                
                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    <ProductionOrderDetailPanel {...props} />
                </div>
            </div>
        </div>
    );
};

export default ProductionDrawer;