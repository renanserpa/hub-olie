import React, { useMemo } from 'react';
import { ProductionOrder } from '../../../types';
import { PRODUCTION_STATUS_COLUMNS } from '../../../constants/production';
import { ProductionKanbanColumn } from './ProductionKanbanColumn';

interface Props {
  orders: ProductionOrder[];
  onDropStatus: (status: ProductionOrder['status']) => void;
  onDragStart: (order: ProductionOrder) => void;
}

export const ProductionKanbanBoard: React.FC<Props> = ({ orders, onDropStatus, onDragStart }) => {
  const grouped = useMemo(() => {
    return PRODUCTION_STATUS_COLUMNS.map((column) => ({
      ...column,
      items: orders.filter((order) => order.status === column.key),
    }));
  }, [orders]);

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {grouped.map((column) => (
        <ProductionKanbanColumn
          key={column.key}
          title={column.label}
          status={column.key}
          items={column.items}
          onDropStatus={onDropStatus}
          onDragStart={onDragStart}
        />
      ))}
    </div>
  );
};
