import React from 'react';
import { LogisticsShipment, ShipmentStatus } from '../../types';
import ShipmentCard from './ShipmentCard';
import { Package, Receipt, Truck, CheckCircle } from 'lucide-react';
import { Send } from 'lucide-react';

interface ShipmentBoardProps {
    shipments: LogisticsShipment[];
}

const COLUMNS: { id: ShipmentStatus; label: string, icon: React.ElementType }[] = [
    { id: 'pending', label: 'Pendente', icon: Package },
    { id: 'quoted', label: 'Frete Cotado', icon: Receipt },
    { id: 'label_created', label: 'Etiquetado', icon: Send },
    { id: 'in_transit', label: 'Em Trânsito', icon: Truck },
    { id: 'delivered', label: 'Entregue', icon: CheckCircle },
];

const ShipmentBoard: React.FC<ShipmentBoardProps> = ({ shipments }) => {
    return (
        <div className="flex gap-4 overflow-x-auto pb-4">
            {COLUMNS.map(column => {
                const columnShipments = shipments.filter(s => s.status === column.id);
                const Icon = column.icon;
                return (
                    <div key={column.id} className="w-80 flex-shrink-0 bg-secondary p-3 rounded-xl">
                        <div className="flex justify-between items-center mb-4 px-1">
                            <h3 className="font-semibold text-sm text-textPrimary flex items-center gap-2">
                                <Icon size={16} className="text-textSecondary" />
                                {column.label}
                            </h3>
                            <span className="text-xs font-medium text-textSecondary bg-background px-2 py-1 rounded-full">
                                {columnShipments.length}
                            </span>
                        </div>
                        <div className="space-y-3 min-h-[200px]">
                            {columnShipments.map(shipment => (
                                <ShipmentCard key={shipment.id} shipment={shipment} />
                            ))}
                        </div>
                    </div>
                )
            })}
        </div>
    );
};

export default ShipmentBoard;