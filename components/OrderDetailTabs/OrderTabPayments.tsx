import React from 'react';
import { Order } from '../../types';
import { useTinyApi } from '../../hooks/useTinyApi';
import { Button } from '../ui/Button';
import { Loader2, Link as LinkIcon } from 'lucide-react';
import { toast } from '../../hooks/use-toast';

const OrderTabPayments: React.FC<{ order: Order, tinyApi: ReturnType<typeof useTinyApi> }> = ({ order, tinyApi }) => {
    
    const handleGenerateLink = () => {
        if (order.customers) {
            tinyApi.createPaymentLink(order.id, order.total, `Pedido ${order.number}`, order.customers);
        } else {
            toast({ title: "Erro", description: "Cliente não encontrado para este pedido.", variant: 'destructive'});
        }
    };
    
    return (
        <div className="space-y-4">
            <h3 className="font-semibold">Integração de Pagamento (Tiny)</h3>
            <p>Status: <span className="font-medium capitalize">{order.payments?.status || 'Pendente'}</span></p>
            <Button onClick={handleGenerateLink} disabled={tinyApi.loading}>
                {tinyApi.loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {order.payments?.checkoutUrl ? 'Recriar Link (Simulado)' : 'Gerar Link (Simulado)'}
            </Button>
            {order.payments?.checkoutUrl && (
                <a href={order.payments.checkoutUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-primary hover:underline ml-4">
                    <LinkIcon size={14} className="mr-2"/>Abrir Link
                </a>
            )}
        </div>
    );
};

export default OrderTabPayments;