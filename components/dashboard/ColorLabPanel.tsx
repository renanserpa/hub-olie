import React from 'react';
import PlaceholderContent from '../PlaceholderContent';
import { Cuboid } from 'lucide-react';

const ColorLabPanel: React.FC = () => {
    return (
        <PlaceholderContent
            title="ColorLab 3D"
            requiredTable="render_assets"
            icon={Cuboid}
        >
            <p className="mt-1 text-sm text-textSecondary">
                Módulo de simulação e renderização 3D para teste de cores e texturas em produtos.
                <br />
                (Integração com Hunyuan3D e Blender em desenvolvimento).
            </p>
        </PlaceholderContent>
    );
};

export default ColorLabPanel;