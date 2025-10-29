import React from 'react';
import { Boxes } from 'lucide-react';
import PlaceholderContent from '../PlaceholderContent';

const PickingPackingPanel: React.FC = () => (
    <PlaceholderContent 
        title="Picking & Packing"
        requiredTable="logistics_pick_tasks & logistics_packages"
        icon={Boxes}
    >
        <p className="mt-1 text-sm text-textSecondary">
            Gerencie as tarefas de separação e o processo de embalagem dos pedidos aqui.
        </p>
    </PlaceholderContent>
);

export default PickingPackingPanel;
