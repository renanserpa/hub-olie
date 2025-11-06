'use client';
import StatCard from '../../components/dashboard/StatCard';
import { Workflow, Cog, CheckCircle, PauseCircle } from 'lucide-react';
// FIX: Corrected import path for ProductionOrder type.
import { ProductionOrder } from '../../types';

export default function ProductionKPIHeader({ orders }: { orders: ProductionOrder[] }) {
  const total = orders.length;
  // FIX: Use correct Portuguese status values for comparison
  const completed = orders.filter((o: ProductionOrder) => o.status === 'finalizado').length;
  // FIX: Use correct Portuguese status values for comparison
  const inProgress = orders.filter((o: ProductionOrder) => o.status === 'em_andamento').length;
  // FIX: Use correct Portuguese status values for comparison
  const paused = orders.filter((o: ProductionOrder) => o.status === 'em_espera').length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard title="Total de Ordens" value={total} icon={Workflow} />
      <StatCard title="Em Produção" value={inProgress} icon={Cog} />
      <StatCard title="Concluídas" value={completed} icon={CheckCircle} />
      <StatCard title="Pausadas" value={paused} icon={PauseCircle} />
    </div>
  );
}