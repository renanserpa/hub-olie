'use client';
import React, { useState } from 'react';
import ProductionTaskCard from './ProductionTaskCard';
import { ProductionOrder } from '../../types';
import { cn } from '../../lib/utils';

interface ProductionColumnProps {
    title: string;
    orders: ProductionOrder[];
    statusKey: string;
    onDrop: (statusKey: string) => void;
    onDragStart: (e: React.DragEvent<HTMLDivElement>, orderId: string) => void;
}

export default function ProductionColumn({ title, orders, statusKey, onDrop, onDragStart }: ProductionColumnProps) {
  const [isOver, setIsOver] = useState(false);

  return (
    <div 
        onDragOver={(e) => { e.preventDefault(); setIsOver(true); }}
        onDragLeave={() => setIsOver(false)}
        onDrop={(e) => { e.preventDefault(); setIsOver(false); onDrop(statusKey); }}
        className={cn(
            "w-80 flex-shrink-0 bg-secondary dark:bg-dark-secondary p-3 rounded-xl transition-colors",
            isOver && "bg-primary/10"
        )}
    >
      <h2 className="text-sm font-semibold mb-3 text-textPrimary dark:text-dark-textPrimary">{title} ({orders.length})</h2>
      <div className="space-y-3 min-h-[400px]">
        {orders.map((o: ProductionOrder) => (
          <ProductionTaskCard key={o.id} order={o} onDragStart={(e) => onDragStart(e, o.id)} />
        ))}
      </div>
    </div>
  );
}
