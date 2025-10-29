import React from 'react';
import { MarketingSegment } from '../../types';
import { Loader2, Users } from 'lucide-react';
import EmptyState from './EmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

interface SegmentManagerProps {
    segments: MarketingSegment[];
    isLoading: boolean;
}

const SegmentManager: React.FC<SegmentManagerProps> = ({ segments, isLoading }) => {
    if (isLoading) {
        return (
            <div className="text-center py-10 flex items-center justify-center gap-2 text-textSecondary">
                <Loader2 className="h-5 w-5 animate-spin"/> Carregando segmentos...
            </div>
        );
    }
    
    if (segments.length === 0) {
        return <EmptyState 
            title="Nenhum Segmento" 
            message="Crie seu primeiro segmento para agrupar clientes com características em comum."
            icon={Users}
        />;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Segmentos de Público</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-secondary">
                            <tr>
                                <th className="p-4 font-semibold text-textSecondary">Nome</th>
                                <th className="p-4 font-semibold text-textSecondary">Tamanho do Público</th>
                                <th className="p-4 font-semibold text-textSecondary">Nº de Regras</th>
                            </tr>
                        </thead>
                        <tbody>
                        {segments.map(segment => (
                            <tr key={segment.id} className="border-b border-border">
                                <td className="p-4 font-medium text-textPrimary">{segment.name}</td>
                                <td className="p-4">{segment.audience_size}</td>
                                <td className="p-4">{segment.rule_count}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
                 <div className="text-center p-6 bg-amber-50 text-amber-800 text-sm rounded-b-lg border-t">
                    🚧 A criação e edição de regras de segmentação está em desenvolvimento.
                </div>
            </CardContent>
        </Card>
    );
};

export default SegmentManager;
