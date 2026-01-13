import React from 'react';
import { BarChart2 } from 'lucide-react';
import EmptyState from './EmptyState';

const PurchaseMetrics: React.FC = () => {
    return (
        <EmptyState 
            title="Métricas em Construção"
            message="O dashboard com KPIs de compras, performance de fornecedores e lead time estará disponível aqui em breve."
            icon={BarChart2}
        />
    );
};

export default PurchaseMetrics;