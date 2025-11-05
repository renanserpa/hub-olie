import React from 'react';
import { MarketingSegment } from '../../types';
import { Loader2, Users, Plus } from 'lucide-react';
import EmptyState from './EmptyState';
import { Button } from '../ui/Button';
import SegmentCard from './SegmentCard';

interface SegmentManagerProps {
    segments: MarketingSegment[];
    isLoading: boolean;
    onNew: () => void;
    onEdit: (segment: MarketingSegment) => void;
}

const SegmentManager: React.FC<SegmentManagerProps> = ({ segments, isLoading, onNew, onEdit }) => {
    if (isLoading) {
        return (
            <div className="text-center py-10 flex items-center justify-center gap-2 text-textSecondary">
                <Loader2 className="h-5 w-5 animate-spin"/> Carregando segmentos...
            </div>
        );
    }
    
    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Gerenciador de Segmentos</h2>
                <Button onClick={onNew}><Plus className="w-4 h-4 mr-2"/> Novo Segmento</Button>
            </div>

            {segments.length === 0 ? (
                <EmptyState 
                    title="Nenhum Segmento" 
                    message="Crie seu primeiro segmento para agrupar clientes com características em comum."
                    icon={Users}
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {segments.map(segment => (
                        <SegmentCard key={segment.id} segment={segment} onEdit={() => onEdit(segment)} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default SegmentManager;