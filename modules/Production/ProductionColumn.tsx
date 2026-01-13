import React, { useState } from 'react';
import ProductionTaskCard from './ProductionTaskCard';
import { ProductionOrder } from '../../types';
import { cn } from '../../lib/utils';

interface ProductionColumnProps {
    title: string;
    status: string;
    orders: ProductionOrder[];
    onDrop: (status: string) => void;
    onDragStart: (e: React.DragEvent<HTMLDivElement>, orderId: string) => void;
    onCardClick: (id: string) => void;
}

const ProductionColumn: React.FC<ProductionColumnProps> = ({ title, status, orders, onDrop, onDragStart, onCardClick }) => {
  const [isOver, setIsOver] = useState(false);
  return (
    <div
      onDrop={(e) => { e.preventDefault(); setIsOver(false); onDrop(status); }}
      onDragOver={(e) => { e.preventDefault(); setIsOver(true); }}
      onDragLeave={() => setIsOver(false)}
      className={cn("w-80 flex-shrink-0 bg-secondary dark:bg-dark-secondary p-3 rounded-xl transition-colors", isOver && "bg-primary/10")}
    >
      <div className="flex justify-between items-center mb-4 px-1">
        <h2 className="text-sm font-semibold mb-2 capitalize text-textPrimary dark:text-dark-textPrimary">{title}</h2>
        <span className="text-xs font-medium text-textSecondary dark:text-dark-textSecondary bg-background dark:bg-dark-background px-2 py-1 rounded-full">
            {orders.length}
        </span>
      </div>
      <div className="space-y-3 min-h-[400px]">
        {orders.map((o) => <ProductionTaskCard key={o.id} order={o} onDragStart={onDragStart} onClick={onCardClick} />)}
      </div>
    </div>
  );
}

export default ProductionColumn;