import React from 'react';
import { Search } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ProductionFiltersProps {
    filters: { status: string, search: string };
    updateFilter: (key: string, value: any) => void;
}

const ProductionFilters: React.FC<ProductionFiltersProps> = ({ filters, updateFilter }) => {
  return (
    <div className="flex justify-between items-center py-2 border-b border-border dark:border-dark-border">
      <div className="relative flex-1 sm:flex-initial sm:w-64">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-textSecondary" />
          </div>
          <input
              type="text"
              placeholder="Buscar ordem..."
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-border rounded-xl shadow-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
      </div>
      <div className="flex gap-2 text-xs">
          {['all','pending','in_progress','quality_check','completed','paused'].map((s) => (
              <button
                  key={s}
                  onClick={() => updateFilter('status', s)}
                  className={cn(
                      'px-3 py-1.5 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 capitalize',
                      filters.status === s 
                      ? 'bg-primary text-white' 
                      : 'bg-secondary dark:bg-dark-secondary text-textSecondary hover:bg-accent dark:hover:bg-dark-accent'
                  )}
              >
                  {s === 'all' ? 'Todos' : s.replace('_',' ')}
              </button>
          ))}
      </div>
    </div>
  );
};

export default ProductionFilters;
