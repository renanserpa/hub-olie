import React, { useState } from 'react';
import { ProductionOrder } from '../../../types';
import { ProductionKanbanCard } from './ProductionKanbanCard';

interface Props {
  title: string;
  status: ProductionOrder['status'];
  items: ProductionOrder[];
  onDropStatus: (status: ProductionOrder['status']) => void;
  onDragStart: (order: ProductionOrder) => void;
}

export const ProductionKanbanColumn: React.FC<Props> = ({ title, status, items, onDropStatus, onDragStart }) => {
  const [isOver, setIsOver] = useState(false);

  return (
    <div
      data-status={status}
      onDragOver={(e) => {
        e.preventDefault();
        setIsOver(true);
      }}
      onDragLeave={() => setIsOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsOver(false);
        onDropStatus(status);
      }}
      className={`flex flex-1 flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-3 transition dark:border-slate-800 dark:bg-slate-900/40 ${
        isOver ? 'ring-2 ring-indigo-400 ring-offset-2 dark:ring-offset-slate-900' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
        <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
          {items.length}
        </span>
      </div>
      <div className="flex flex-col gap-3">
        {items.map((order) => (
          <ProductionKanbanCard key={order.id} order={order} onDragStart={onDragStart} />
        ))}
        {items.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 p-4 text-center text-sm text-slate-500 dark:border-slate-700">
            Nenhuma ordem neste status
          </div>
        )}
      </div>
    </div>
  );
};
