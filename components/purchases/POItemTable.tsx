import React from 'react';
import { PurchaseOrderItem } from '../../types';

interface POItemTableProps {
    items: PurchaseOrderItem[];
}

const POItemTable: React.FC<POItemTableProps> = ({ items }) => {
    return (
        <div className="overflow-x-auto border rounded-lg">
            <table className="w-full text-sm text-left">
                <thead className="bg-secondary">
                    <tr>
                        <th className="p-2 font-semibold text-textSecondary">Material</th>
                        <th className="p-2 font-semibold text-textSecondary text-right">Qtd</th>
                        <th className="p-2 font-semibold text-textSecondary text-right">Recebido</th>
                        <th className="p-2 font-semibold text-textSecondary text-right">Preço Unit.</th>
                        <th className="p-2 font-semibold text-textSecondary text-right">Total</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map(item => (
                        <tr key={item.id} className="border-b border-border last:border-b-0">
                            <td className="p-2 font-medium text-textPrimary">{item.material_name}</td>
                            <td className="p-2 text-right">{item.quantity}</td>
                            <td className="p-2 text-right">{item.received_quantity}</td>
                            <td className="p-2 text-right">R$ {item.unit_price.toFixed(2)}</td>
                            <td className="p-2 text-right font-medium">R$ {item.total.toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default POItemTable;