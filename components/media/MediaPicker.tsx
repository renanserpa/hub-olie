import React from 'react';
import { Card, CardContent } from '../ui/Card';
import { ImagePlus } from 'lucide-react';

interface MediaPickerProps {
    onSelect: (mediaId: string) => void;
}

const MediaPicker: React.FC<MediaPickerProps> = ({ onSelect }) => {
    return (
        <Card>
            <CardContent>
                <div className="text-center text-textSecondary py-10 border-2 border-dashed border-border rounded-xl">
                    <ImagePlus className="mx-auto h-10 w-10 text-gray-400" />
                    <h3 className="mt-3 text-md font-medium text-textPrimary">Seletor de Mídia</h3>
                    <p className="mt-1 text-xs">Funcionalidade para selecionar mídias existentes em desenvolvimento.</p>
                </div>
            </CardContent>
        </Card>
    );
};

export default MediaPicker;
