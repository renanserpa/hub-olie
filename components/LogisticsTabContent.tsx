import React from 'react';
import { Truck } from 'lucide-react';
import PlaceholderContent from './PlaceholderContent';

const LogisticsTabContent: React.FC = () => (
    <PlaceholderContent 
        title="Gestão de Logística"
        requiredTable="logistics_delivery_methods, logistics_freight_params, etc."
        icon={Truck}
    />
);

export default LogisticsTabContent;