import React from 'react';
import { ProductionOrder } from '../../types';
import { Card } from '../../components/ui/Card';
import { User, Package } from 'lucide-react';

interface ProductionOrderCardProps {
    order: ProductionOrder & { customer_name?: string, item_count?: number };
    onClick: () => void;
    onDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
}

const ProductionOrderCard: React.FC<ProductionOrderCardProps> = ({ order, onClick, onDragStart }) => {
  
  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.style.opacity = '1';
    e.currentTarget.classList.remove('shadow-lg', 'rotate-3');
  };

  const handleInternalDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.style.opacity = '0.5';
    e.currentTarget.classList.add('shadow-lg', 'rotate-3');
    onDragStart(e);
  }
  
  return (
    <Card 
      draggable
      onDragStart={handleInternalDragStart}
      onDragEnd={handleDragEnd}
      onClick={onClick}
      className="p-3 shadow-sm hover:shadow-md transition cursor-pointer active:cursor-grabbing"
    >
      <p className="text-xs text-textSecondary font-mono">{order.po_number}</p>
      <h3 className="text-sm font-semibold">{order.product?.name}</h3>
      
      <div className="mt-2 pt-2 border-t border-border/50 space-y-1.5 text-xs text-textSecondary">
          {order.customer_name && (
              <div className="flex items-center gap-1.5">
                  <User size={12} />
                  <span className="font-medium text-textPrimary">{order.customer_name}</span>
              </div>
          )}
          <div className="flex items-center gap-1.5">
              <Package size={12} />
              <span>Qtd. OP: {order.quantity} (Total Pedido: {order.item_count})</span>
          </div>
      </div>
      
      <p className="text-xs text-textSecondary mt-2">Prazo: {new Date(order.due_date).toLocaleDateString('pt-BR')}</p>
    </Card>
  );
}

export default ProductionOrderCard;