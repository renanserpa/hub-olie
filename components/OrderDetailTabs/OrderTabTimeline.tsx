import React from 'react';
import { Order } from '../../types';

const OrderTabTimeline: React.FC<{ order: Order }> = ({ order }) => {
    return (
        <div>
            {order.timeline.length > 0 ? (
                <div className="space-y-4">
                    {order.timeline.map(event => (
                         <div key={event.id}>
                            <p className="font-medium">{event.description}</p>
                            <p className="text-xs text-textSecondary">{new Date(event.created_at).toLocaleString('pt-BR')}</p>
                         </div>
                    ))}
                </div>
            ) : (
                <p className="text-textSecondary">Nenhum evento na timeline ainda.</p>
            )}
        </div>
    );
};

export default OrderTabTimeline;