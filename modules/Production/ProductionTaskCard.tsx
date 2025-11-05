'use client';
import React from 'react';
import { ProductionOrder } from '../../types';
import { Card } from '../../components/ui/Card';
import { Package, User } from 'lucide-react';

interface ProductionTaskCardProps {
    order: ProductionOrder;
    onDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
}

export default function ProductionTaskCard({ order, onDragStart }: ProductionTaskCardProps) {
  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.style.opacity = '1';
  };
  
  const handleDragStartInternal = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.style.opacity = '0.5';
    onDragStart(e);
  };

  return (
    <Card 
        className="hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing p-3"
        draggable
        onDragStart={handleDragStartInternal}
        onDragEnd={handleDragEnd}
    >
      <h3 className="font-bold text-sm text-textPrimary truncate font-mono">{order.order_code}</h3>
      <p className="text-xs text-textSecondary truncate">{order.product_name}</p>
      
      <div className="mt-3 space-y-2 text-xs text-textSecondary">
          <div className="flex items-center gap-2">
              <Package size={14} />
              <span>{order.quantity} unidades</span>
          </div>
          {order.assigned_to && (
              <div className="flex items-center gap-2">
                  <User size={14} />
                  <span>{order.assigned_to}</span>
              </div>
          )}
      </div>
    </Card>
  );
}
