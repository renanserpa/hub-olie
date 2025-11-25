import React from 'react';
import { Skeleton } from './Skeleton';
import { EmptyState } from './FeedbackStates';

interface TableProps<T> {
  data: T[];
  columns: { key: keyof T; label: string; render?: (value: any, row: T) => React.ReactNode }[];
  emptyMessage?: string;
}

export const TableEmptyState: React.FC<{ message?: string }> = ({ message }) => (
  <EmptyState title={message || 'Nenhum registro encontrado.'} />
);

export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({ rows = 4, columns = 4 }) => (
  <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
    <div className="grid gap-2 bg-slate-50 p-3 dark:bg-slate-900/40">
      <Skeleton className="h-4 w-32" />
    </div>
    <div className="divide-y divide-slate-100 dark:divide-slate-800">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="grid grid-cols-1 gap-2 p-3 md:grid-cols-4">
          {Array.from({ length: columns }).map((__, colIndex) => (
            <Skeleton key={colIndex} className="h-4 w-full" />
          ))}
        </div>
      ))}
    </div>
  </div>
);

export const Table = <T extends Record<string, any>>({ data, columns, emptyMessage }: TableProps<T>) => {
  if (!data.length) {
    return <TableEmptyState message={emptyMessage} />;
  }
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-700 dark:bg-slate-900/40 dark:text-slate-200">
            <tr>
              {columns.map((col) => (
                <th key={String(col.key)} className="px-4 py-3 font-semibold whitespace-nowrap">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={(row[columns[0].key] as string) || index} className="border-t border-slate-100 dark:border-slate-800">
                {columns.map((col) => (
                  <td key={String(col.key)} className="px-4 py-3 align-middle">
                    {col.render ? col.render(row[col.key], row) : (row[col.key] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
