import React from 'react';
import { KPI } from './useDashboard';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function DashboardKPI({ kpis }: { kpis: KPI[] }) {
  if (!kpis?.length) {
      return (
          <div className="text-center text-textSecondary py-8 border-2 border-dashed rounded-lg">
              <p>Nenhum KPI para exibir.</p>
          </div>
      );
  }
  return (
    <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {kpis.slice(0, 4).map((k: KPI) => (
        <div key={k.id} className="border rounded-lg p-4 bg-card dark:bg-dark-card shadow-sm">
          <h3 className="text-sm font-medium text-textSecondary truncate">{k.name}</h3>
          <div className="text-2xl font-bold mt-1">
              {k.unit === 'R$' ? k.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL'}) : k.value}
              {k.unit && k.unit !== 'R$' ? k.unit : ''}
          </div>
          <div className={cn('text-xs mt-1 flex items-center gap-1', k.trend >= 0 ? 'text-green-600' : 'text-red-600')}>
            {k.trend > 0 ? <ArrowUp size={12} /> : k.trend < 0 ? <ArrowDown size={12} /> : <Minus size={12} />}
            <span>{Math.abs(k.trend * 100).toFixed(1)}% vs. período anterior</span>
          </div>
        </div>
      ))}
    </section>
  );
}
