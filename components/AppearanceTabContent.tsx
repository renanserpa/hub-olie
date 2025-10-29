import React from 'react';
import { Image as ImageIcon } from 'lucide-react';
import PlaceholderContent from './PlaceholderContent';

const AppearanceTabContent: React.FC = () => (
    <PlaceholderContent 
        title="Aparência e Mídia"
        requiredTable="media_assets & storage buckets"
        icon={ImageIcon}
    >
        <p className="mt-1 text-sm text-textSecondary">
            Personalize a aparência do sistema com seu logo e tema, e gerencie a biblioteca de mídias para produtos e materiais.
        </p>
    </PlaceholderContent>
);

export default AppearanceTabContent;
