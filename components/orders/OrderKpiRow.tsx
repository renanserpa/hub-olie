import React from 'react';
import { Clock, CreditCard, Workflow, PackageCheck } from 'lucide-react';
import StatCard from '../dashboard/StatCard';

interface OrderKpiRowProps {
    stats: {
        pending: number;
        paid: number;
        inProduction: number;
        awaitingShipping: number;
    }
}

export const OrderKpiRow: React.FC<OrderKpiRowProps> = ({ stats }) => {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard 
                title="Aguardando Pag." 
                value={stats.pending} 
                icon={Clock}
                description="Pedidos aguardando pagamento"
            />
            <StatCard 
                title="Pagos" 
                value={stats.paid} 
                icon={CreditCard} 
                description="Liberados para produção"
            />
            <StatCard 
                title="Em Produção" 
                value={stats.inProduction} 
                icon={Workflow}
                description="Pedidos no chão de fábrica"
            />
            <StatCard 
                title="Prontos p/ Envio" 
                value={stats.awaitingShipping} 
                icon={PackageCheck}
                description="Aguardando expedição"
            />
        </div>
    );
};

export default OrderKpiRow;