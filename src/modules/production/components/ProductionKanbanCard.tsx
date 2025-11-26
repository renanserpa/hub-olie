import React from 'react';
import { getPriorityMeta } from '../../../constants/production';
import { ProductionOrder } from '../../../types';

interface Props {
  order: ProductionOrder;
  onDragStart: (order: ProductionOrder) => void;
}

const statusColor: Record<ProductionOrder['status'], string> = {
  planned: 'bg-slate-100 text-slate-700',
  in_progress: 'bg-amber-100 text-amber-700',
  completed: 'bg-emerald-100 text-emerald-700',
  blocked: 'bg-rose-100 text-rose-700',
};

export const ProductionKanbanCard: React.FC<Props> = ({ order, onDragStart }) => {
  const plannedEnd = order.planned_end_date ? new Date(order.planned_end_date).toLocaleDateString('pt-BR') : null;
  const priorityMeta = getPriorityMeta(order.priority);

  return (
    <div
      draggable
      onDragStart={() => onDragStart(order)}
      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs uppercase tracking-wide text-slate-500">{order.code}</p>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusColor[order.status]}`}>
            {order.status}
          </span>
          {priorityMeta ? (
            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${priorityMeta.className}`}>
              {priorityMeta.label}
            </span>
          ) : (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">Sem prioridade</span>
          )}
        </div>
      </div>
      {order.order_id && (
        <p className="mt-1 text-sm text-slate-600">Pedido: {order.order_id}</p>
      )}
      <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">
        Início: {new Date(order.planned_start_date).toLocaleDateString('pt-BR')}
      </p>
      {plannedEnd && <p className="text-sm text-slate-500">Entrega: {plannedEnd}</p>}
    </div>
  );
};
