'use client';
import React from 'react';
import { ProductionOrder } from '../../types';
import { Card } from '../../components/ui/Card';

interface ProductionTaskCardProps {
    order: ProductionOrder;
    onDragStart: (e: React.DragEvent<HTMLDivElement>, orderId: string) => void;
    onClick: (id: string) => void;
}

const ProductionTaskCard: React.FC<ProductionTaskCardProps> = ({ order, onDragStart, onClick }) => {
  const handleDragStartInternal = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.style.opacity = '0.5';
    onDragStart(e, order.id);
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.style.opacity = '1';
  };
  
  return (
    <Card 
      draggable
      onDragStart={handleDragStartInternal}
      onDragEnd={handleDragEnd}
      onClick={() => onClick(order.id)}
      className="p-3 shadow-sm hover:shadow-md transition cursor-pointer active:cursor-grabbing"
    >
      <h3 className="text-sm font-semibold">{order.product_name || order.product?.name}</h3>
      <p className="text-xs text-textSecondary">Qtd: {order.quantity} — {order.po_number}</p>
      <div className="mt-2 text-xs text-textSecondary capitalize">Status: <b>{order.status.replace('_', ' ')}</b></div>
    </Card>
  );
}

export default ProductionTaskCard;
