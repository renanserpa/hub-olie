import React from 'react';
import { LogisticsShipment } from '../../types';
import { Card } from '../ui/Card';
import { cn } from '../../lib/utils';

interface ShipmentCardProps {
    shipment: LogisticsShipment;
    className?: string;
}

const ShipmentCard: React.FC<ShipmentCardProps> = ({ shipment, className }) => {
    return (
        <Card className={cn('hover:shadow-md transition-shadow', className)}>
            <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-textPrimary">{shipment.order_number}</h3>
                </div>
                <p className="text-sm text-textSecondary">{shipment.customer_name}</p>
                {shipment.tracking_code && (
                    <p className="text-xs text-textSecondary mt-2 font-mono bg-background p-1 rounded">
                        {shipment.tracking_code}
                    </p>
                )}
            </div>
        </Card>
    );
};

export default ShipmentCard;