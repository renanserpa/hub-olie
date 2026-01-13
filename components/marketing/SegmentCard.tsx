import React from 'react';
import { MarketingSegment } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Users, Edit } from 'lucide-react';

interface SegmentCardProps {
    segment: MarketingSegment;
    onEdit: () => void;
}

const ruleLabels = {
    total_spent: 'Total Gasto',
    order_count: 'Qtd. Pedidos',
    last_purchase_days: 'Última Compra',
    tags: 'Tags',
};

const operatorLabels = {
    greater_than: '>',
    less_than: '<',
    equals: '=',
    contains: 'contém',
    not_contains: 'não contém',
};

const SegmentCard: React.FC<SegmentCardProps> = ({ segment, onEdit }) => {
    return (
        <Card className="flex flex-col">
            <CardHeader className="flex-row items-start justify-between">
                <div>
                    <CardTitle className="text-lg">{segment.name}</CardTitle>
                    <p className="text-sm text-textSecondary">{segment.description}</p>
                </div>
                 <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={onEdit}>
                    <Edit size={16} />
                </Button>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col">
                <div className="flex items-center gap-2 text-primary font-semibold mb-4">
                    <Users size={18} />
                    <span>{segment.audience_size} Clientes</span>
                </div>
                
                <div className="flex-grow space-y-2 text-sm text-textSecondary border-t pt-3">
                    <h4 className="font-semibold text-xs text-textPrimary uppercase tracking-wider">Regras</h4>
                    {segment.rules.map(rule => (
                        <div key={rule.id} className="flex items-center gap-2 p-1.5 bg-secondary rounded-md">
                            <span className="font-medium text-textPrimary">{ruleLabels[rule.field]}</span>
                            <span className="font-mono text-primary">{operatorLabels[rule.operator]}</span>
                            <span className="font-medium text-textPrimary truncate">{rule.value}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default SegmentCard;