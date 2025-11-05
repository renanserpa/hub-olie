'use client';
import React, { useState } from 'react';
import ProductionColumn from './ProductionColumn';
import { ProductionOrder } from '../../types';

interface ProductionKanbanProps {
    grouped: Record<string, ProductionOrder[]>;
    onStatusChange: (id: string, newStatus: string) => void;
}

export default function ProductionKanban({ grouped, onStatusChange }: ProductionKanbanProps) {
  const [draggedOrderId, setDraggedOrderId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, orderId: string) => {
    setDraggedOrderId(orderId);
    e.dataTransfer.setData('orderId', orderId);
  };

  const handleDrop = (newStatus: string) => {
    if (draggedOrderId) {
      const order = Object.values(grouped).flat().find(o => o.id === draggedOrderId);
      if(order && order.status !== newStatus) {
        onStatusChange(draggedOrderId, newStatus);
      }
      setDraggedOrderId(null);
    }
  };

  const columns = [
    { key: 'pending', label: 'Pendente' },
    { key: 'in_progress', label: 'Em Produção' },
    { key: 'quality_check', label: 'Controle de Qualidade' },
    { key: 'completed', label: 'Concluído' },
    { key: 'paused', label: 'Pausado' },
  ];

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map((col) => (
        <ProductionColumn
          key={col.key}
          title={col.label}
          orders={grouped[col.key] || []}
          statusKey={col.key}
          onDrop={handleDrop}
          onDragStart={handleDragStart}
        />
      ))}
    </div>
  );
}
