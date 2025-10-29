import React from 'react';
import { Order } from '../../types';

const OrderTabItems: React.FC<{ order: Order }> = ({ order }) => {
    return (
        <div className="space-y-3">
            {order.items.map(item => (
                <div key={item.id} className="p-3 border rounded-lg bg-secondary/50">
                    <div className="flex justify-between font-medium">
                        <span>{item.quantity}x {item.product_name}</span>
                        <span>R$ {item.total.toFixed(2)}</span>
                    </div>
                    {/* TODO: Render customization details if they exist */}
                </div>
            ))}
        </div>
    );
};

export default OrderTabItems;