import React from 'react';
import { Workflow, CheckCircle, AlertCircle, Zap } from 'lucide-react';
import StatCard from '../dashboard/StatCard'; // Reusing the dashboard StatCard

interface ProductionKpiRowProps {
    kpis: {
        openOrders: number;
        completedToday: number;
        overdue: number;
        efficiency: string;
    }
}

const ProductionKpiRow: React.FC<ProductionKpiRowProps> = ({ kpis }) => {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard 
                title="OPs em Aberto"
                value={kpis.openOrders}
                icon={Workflow}
                description="Ordens em produção ou em espera"
            />
            <StatCard 
                title="Concluídas Hoje"
                value={kpis.completedToday}
                icon={CheckCircle}
                description="Ordens finalizadas no dia de hoje"
            />
             <StatCard 
                title="OPs em Atraso"
                value={kpis.overdue}
                icon={AlertCircle}
                description="Ordens com prazo de entrega vencido"
            />
             <StatCard 
                title="Eficiência (OTD)"
                value={kpis.efficiency}
                icon={Zap}
                description="Entregas dentro do prazo"
            />
        </div>
    );
};

export default ProductionKpiRow;