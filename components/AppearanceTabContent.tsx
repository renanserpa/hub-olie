
import React from 'react';
import { Card, CardContent } from './ui/Card';
import { Paintbrush } from 'lucide-react';

const AppearanceTabContent: React.FC = () => (
    <Card>
        <CardContent>
            <div className="text-center text-textSecondary py-16 border-2 border-dashed border-border rounded-xl">
                <Paintbrush className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-textPrimary">Personalização da Aparência</h3>
                <p className="mt-1 text-sm text-textSecondary">Funcionalidades como upload de logo e biblioteca de mídia estarão disponíveis em breve.</p>
            </div>
        </CardContent>
    </Card>
);

export default AppearanceTabContent;
