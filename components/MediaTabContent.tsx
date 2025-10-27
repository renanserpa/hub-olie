
import React from 'react';
import { Card, CardContent } from './ui/Card';
import { Image } from 'lucide-react';

const MediaTabContent: React.FC = () => (
    <Card>
        <CardContent>
            <div className="text-center text-textSecondary py-16 border-2 border-dashed border-border rounded-xl">
                <Image className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-textPrimary">Biblioteca de Mídia</h3>
                <p className="mt-1 text-sm text-textSecondary">O gerenciador de mídias para produtos e materiais estará disponível em breve.</p>
            </div>
        </CardContent>
    </Card>
);

export default MediaTabContent;
