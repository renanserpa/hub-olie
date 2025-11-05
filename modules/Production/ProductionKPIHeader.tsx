import React from 'react';
import { ProductionOrder } from '../../types';
import StatCard from '../../components/dashboard/StatCard';
import { Workflow, Cog, CheckCircle, PauseCircle } from 'lucide-react';

interface ProductionKPIHeaderProps {
    orders: ProductionOrder[];
}

const ProductionKPIHeader: React.FC<ProductionKPIHeaderProps> = ({ orders }) => {
  const total = orders.length;
  const completed = orders.filter((o: ProductionOrder) => o.status === 'completed').length;
  const inProgress = orders.filter((o: ProductionOrder) => o.status === 'in_progress').length;
  const paused = orders.filter((o: ProductionOrder) => o.status === 'paused').length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard title="Total de Ordens" value={total} icon={Workflow} />
      <StatCard title="Em Produção" value={inProgress} icon={Cog} />
      <StatCard title="Concluídas" value={completed} icon={CheckCircle} />
      <StatCard title="Pausadas" value={paused} icon={PauseCircle} />
    </div>
  );
}

export default ProductionKPIHeader;
