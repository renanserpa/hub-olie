import React from 'react';
import { Truck } from 'lucide-react';
import PlaceholderContent from './PlaceholderContent';

const LogisticsTabContent: React.FC = () => (
    <PlaceholderContent
        title="Configurações de Logística"
        requiredTable="config_delivery_methods, etc."
        icon={Truck}
    >
        <p className="mt-1 text-sm text-textSecondary">
            Gerencie métodos de entrega, parâmetros de frete e tipos de embalagem.
        </p>
    </PlaceholderContent>
);

export default LogisticsTabContent;
