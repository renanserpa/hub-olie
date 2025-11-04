import React from 'react';
import { Inbox, DollarSign, PackageCheck, Ban } from 'lucide-react';
import StatCard from '../dashboard/StatCard';

interface OrderKpiRowProps {
    stats: {
        newOrders: number;
        revenueToday: number;
        awaitingShipping: number;
        cancelledThisMonth: number;
    }
}

export const OrderKpiRow: React.FC<OrderKpiRowProps> = ({ stats }) => {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard 
                title="Novos Pedidos" 
                value={stats.newOrders} 
                icon={Inbox}
                description="Aguardando pagamento"
            />
            <StatCard 
                title="Faturado Hoje" 
                value={stats.revenueToday.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} 
                icon={DollarSign} 
                description="Pedidos pagos no dia de hoje"
            />
            <StatCard 
                title="Aguardando Envio" 
                value={stats.awaitingShipping} 
                icon={PackageCheck}
                description="Prontos para expedição"
            />
            <StatCard 
                title="Cancelados (Mês)" 
                value={stats.cancelledThisMonth} 
                icon={Ban}
                description="Pedidos cancelados este mês"
            />
        </div>
    );
};

export default OrderKpiRow;