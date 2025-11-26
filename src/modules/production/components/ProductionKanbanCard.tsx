import React from 'react';
import { Link } from 'react-router-dom';
import { PRODUCTION_STATUS_META } from '../../../constants/production';
import { formatDate } from '../../../lib/utils/format';
import { ProductionOrder } from '../../../types';

interface Props {
  order: ProductionOrder;
  onDragStart: (order: ProductionOrder) => void;
}

export const ProductionKanbanCard: React.FC<Props> = ({ order, onDragStart }) => {
  const plannedEnd = formatDate(order.planned_end_date);
  const plannedStart = formatDate(order.planned_start_date);
  const statusMeta = PRODUCTION_STATUS_META[order.status];

  return (
    <Link to={`/production/${order.id}`} className="block" draggable={false}>
      <div
        draggable
        onDragStart={() => onDragStart(order)}
        className="group relative rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
      >
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">{order.code}</p>
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${statusMeta.badgeClass} ${statusMeta.textClass}`}
          >
            {statusMeta.label}
          </span>
        </div>
        <p className="mt-1 text-xs text-amber-600">Prioridade: {order.priority}</p>
        {order.order_id && (
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-200">Pedido: {order.order_id}</p>
        )}
        <div className="mt-3 flex flex-col gap-1 text-sm text-slate-600 dark:text-slate-300">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Início</span>
            <span className="font-medium text-slate-800 dark:text-slate-100">{plannedStart}</span>
          </div>
          {order.planned_end_date && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Entrega</span>
              <span className="font-medium text-slate-800 dark:text-slate-100">{plannedEnd}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};
