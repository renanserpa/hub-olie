import React from 'react';
import { Settings } from 'lucide-react';
import PlaceholderContent from '../PlaceholderContent';

const SettingsPanel: React.FC = () => (
     <PlaceholderContent 
        title="Configurações de Logística"
        requiredTable="logistics_delivery_methods, etc."
        icon={Settings}
    >
        <p className="mt-1 text-sm text-textSecondary">
            Configure métodos de entrega, parâmetros de frete e tipos de embalagem.
        </p>
    </PlaceholderContent>
);

export default SettingsPanel;
