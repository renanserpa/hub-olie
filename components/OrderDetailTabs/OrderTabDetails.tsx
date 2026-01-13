import React from 'react';
import { Order } from '../../types';
import { Badge } from '../ui/Badge';
import { cn } from '../../lib/utils';
import { User, ShoppingCart, Truck, Hash } from 'lucide-react';

const DetailItem: React.FC<{ label: string; value?: string | number | null; className?: string }> = ({ label, value, className }) => (
    <div className={cn("py-2", className)}>
        <p className="text-xs text-textSecondary dark:text-dark-textSecondary">{label}</p>
        <p className="font-medium text-sm text-textPrimary dark:text-dark-textPrimary">{value || 'Não informado'}</p>
    </div>
);

const Section: React.FC<{ title: string; icon: React.ElementType; children: React.ReactNode }> = ({ title, icon: Icon, children }) => (
    <div className="bg-card dark:bg-dark-card p-4 rounded-xl border border-border dark:border-dark-border">
        <h3 className="text-md font-semibold text-textPrimary dark:text-dark-textPrimary mb-3 flex items-center gap-2">
            <Icon size={18} className="text-primary"/>
            {title}
        </h3>
        {children}
    </div>
);

const OrderTabDetails: React.FC<{ order: Order }> = ({ order }) => {
    
    const address = order.customers?.address;
    const fullAddress = address ? `${address.street}, ${address.number || 's/n'}${address.complement ? ` - ${address.complement}` : ''} - ${address.neighborhood}, ${address.city} - ${address.state}, ${address.zip}` : 'Não informado';

    return (
        <div className="space-y-6">
            <Section title="Informações do Cliente" icon={User}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                    <DetailItem label="Nome" value={order.customers?.name} />
                    <DetailItem label="Documento" value={order.customers?.document} />
                    <DetailItem label="Email" value={order.customers?.email} />
                    <DetailItem label="Telefone" value={order.customers?.phone} />
                </div>
            </Section>

            <Section title="Resumo do Pedido" icon={ShoppingCart}>
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 items-start">
                    <div>
                        <p className="text-xs text-textSecondary dark:text-dark-textSecondary">Status</p>
                        <Badge variant="secondary" className="capitalize mt-1">{order.status.replace(/_/g, ' ')}</Badge>
                    </div>
                    <DetailItem label="Origem / Canal" value={order.origin} />
                    <DetailItem label="Data de Criação" value={new Date(order.created_at).toLocaleString('pt-BR')} />
                </div>
            </Section>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 bg-card dark:bg-dark-card p-4 rounded-xl border border-border dark:border-dark-border items-center">
                <div className="md:col-span-3 grid grid-cols-3 gap-2">
                    <DetailItem label="Subtotal" value={`R$ ${order.subtotal.toFixed(2)}`} />
                    <DetailItem label="Frete" value={`R$ ${order.shipping_fee.toFixed(2)}`} />
                    <DetailItem label="Descontos" value={`- R$ ${order.discounts.toFixed(2)}`} />
                </div>
                <div className="md:col-span-2 p-3 bg-primary/10 dark:bg-primary/20 rounded-lg text-right">
                    <p className="text-xs text-primary font-semibold">TOTAL DO PEDIDO</p>
                    <p className="font-bold text-2xl text-primary">R$ {order.total.toFixed(2)}</p>
                </div>
            </div>

            <Section title="Endereço de Entrega" icon={Truck}>
                <DetailItem label="Endereço Completo" value={fullAddress} />
            </Section>

            {order.notes && (
                 <Section title="Observações Internas" icon={Hash}>
                    <p className="text-sm text-textSecondary dark:text-dark-textSecondary bg-secondary dark:bg-dark-secondary p-3 rounded-md whitespace-pre-wrap">{order.notes}</p>
                </Section>
            )}
        </div>
    );
};

export default OrderTabDetails;
