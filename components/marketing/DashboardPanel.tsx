import React from 'react';
import { BarChart2 } from 'lucide-react';
import EmptyState from './EmptyState';

const DashboardPanel: React.FC = () => {
    return (
        <EmptyState 
            title="Dashboard em Construção"
            message="As métricas de performance, KPIs e gráficos estarão disponíveis aqui em breve."
            icon={BarChart2}
        />
    );
};

export default DashboardPanel;
