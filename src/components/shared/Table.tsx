import React from 'react';

interface TableProps<T> {
  data: T[];
  columns: { key: keyof T; label: string; render?: (value: any, row: T) => React.ReactNode }[];
  emptyMessage?: string;
}

export const Table = <T extends Record<string, any>>({ data, columns, emptyMessage }: TableProps<T>) => {
  if (!data.length) {
    return <p className="text-sm text-slate-600">{emptyMessage || 'Nenhum registro encontrado.'}</p>;
  }
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 dark:bg-slate-900/40 text-slate-700 dark:text-slate-200">
          <tr>
            {columns.map((col) => (
              <th key={String(col.key)} className="px-4 py-3 font-semibold">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row[columns[0].key] as string} className="border-t border-slate-100 dark:border-slate-800">
              {columns.map((col) => (
                <td key={String(col.key)} className="px-4 py-3">
                  {col.render ? col.render(row[col.key], row) : (row[col.key] as React.ReactNode)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
