import React from 'react';
import { ProductionOrder } from '../../types';
import { Card } from '../../components/ui/Card';

interface ProductionOrderCardProps {
    order: ProductionOrder;
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
      <p className="text-xs text-textSecondary">Qtd: {order.quantity}</p>
      <p className="text-xs text-textSecondary mt-2">Prazo: {new Date(order.due_date).toLocaleDateString('pt-BR')}</p>
    </Card>
  );
}

export default ProductionOrderCard;