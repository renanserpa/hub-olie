import React from 'react';
import { Order } from '../../types';

const DetailItem = ({ label, value }: { label: string, value?: string | number | null }) => (
    <div>
        <p className="text-sm text-textSecondary">{label}</p>
        <p className="font-medium text-textPrimary">{value || 'N/A'}</p>
    </div>
);

const OrderTabDetails: React.FC<{ order: Order }> = ({ order }) => {
    return (
        <div className="space-y-6">
             <div className="grid grid-cols-2 gap-4">
                <DetailItem label="Cliente" value={order.customers?.name} />
                <DetailItem label="Email" value={order.customers?.email} />
                <DetailItem label="Telefone" value={order.customers?.phone} />
                <DetailItem label="Origem" value={order.origin} />
             </div>
             <div className="grid grid-cols-3 gap-4 border-t pt-4">
                 <DetailItem label="Subtotal" value={`R$ ${order.subtotal.toFixed(2)}`} />
                 <DetailItem label="Frete" value={`R$ ${order.shipping_fee.toFixed(2)}`} />
                 <DetailItem label="Total" value={`R$ ${order.total.toFixed(2)}`} />
             </div>
        </div>
    );
};

export default OrderTabDetails;