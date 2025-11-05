'use client';
import React, { useState, useMemo } from 'react';
import ProductionColumn from './ProductionColumn';
import { ProductionOrder } from './useProduction';

const statuses = ['pending','in_progress','quality_check','completed','paused'];

interface ProductionKanbanProps {
  orders: ProductionOrder[];
  onStatusChange: (orderId: string, newStatus: string) => void;
}

export default function ProductionKanban({ orders, onStatusChange }: ProductionKanbanProps) {
  const [draggedOrderId, setDraggedOrderId] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const g: Record<string, ProductionOrder[]> = {};
    statuses.forEach((s) => g[s] = []);
    orders.forEach((o) => {
        if (g[o.status]) {
            g[o.status].push(o)
        }
    });
    return g;
  }, [orders]);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, orderId: string) => {
    setDraggedOrderId(orderId);
    e.dataTransfer.setData('orderId', orderId);
  };
  
  const handleDrop = (newStatus: string) => {
    if (draggedOrderId) {
      onStatusChange(draggedOrderId, newStatus);
    }
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {statuses.map((s) => (
        <ProductionColumn 
            key={s} 
            title={s.replace('_', ' ')} 
            status={s}
            orders={grouped[s] || []} 
            onDrop={handleDrop}
            onDragStart={handleDragStart}
        />
      ))}
    </div>
  );
}
