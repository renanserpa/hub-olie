'use client';
import { cn } from '../../lib/utils';
import { Search } from 'lucide-react';

export default function ProductionFilters({ filters, updateFilter }: any) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-border">
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-textSecondary" />
        </div>
        <input
          type="text"
          placeholder="Buscar ordem ou produto..."
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
          className="border rounded-lg px-3 py-1.5 pl-9 text-sm w-64 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>
      <div className="flex gap-2 text-xs">
        {['all','pending','in_progress','quality_check','completed','paused'].map((s) => (
          <button
            key={s}
            onClick={() => updateFilter('status', s)}
            className={cn(`px-3 py-1.5 rounded-lg border font-medium capitalize`, 
              filters.status === s 
              ? 'bg-primary/10 border-primary text-primary' 
              : 'bg-secondary border-transparent text-textSecondary hover:bg-accent'
            )}
          >
            {s === 'all' ? 'Todos' : s.replace('_',' ')}
          </button>
        ))}
      </div>
    </div>
  );
}
