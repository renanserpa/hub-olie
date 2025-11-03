import React from 'react';
import { BarChart } from 'lucide-react';

const InventoryChart: React.FC = () => {
    return (
        <div className="h-48 flex flex-col items-center justify-center text-center text-textSecondary dark:text-dark-textSecondary bg-secondary dark:bg-dark-secondary rounded-lg my-6">
            <BarChart className="w-10 h-10 text-gray-400 mb-2" />
            <p className="text-sm font-medium">Gráfico de Movimentações</p>
            <p className="text-xs">(Componente de gráfico em desenvolvimento)</p>
        </div>
    );
};

export default InventoryChart;
