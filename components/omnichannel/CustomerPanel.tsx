import React, { useState } from 'react';
import { Contact, Order, Quote } from '../../types';
import { ChevronDown, User, MapPin, Package, FileText, Check } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';

interface CustomerPanelProps {
    customer: Contact | null | undefined;
    orders: Order[];
    quote: Quote | null;
}

interface CollapsibleSectionProps {
    title: string;
    icon: React.ElementType;
    children: React.ReactNode;
    defaultOpen?: boolean;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ title, icon: Icon, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="border-b border-border">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-3 text-left font-medium text-textPrimary hover:bg-secondary/30"
            >
                <span className="flex items-center gap-3 text-sm">
                    <Icon size={16} className="text-textSecondary" />
                    {title}
                </span>
                <ChevronDown size={18} className={cn('transition-transform text-textSecondary', isOpen && 'rotate-180')} />
            </button>
            {isOpen && <div className="p-3 pt-0 text-sm text-textSecondary">{children}</div>}
        </div>
    );
};

const CustomerPanel: React.FC<CustomerPanelProps> = ({ customer, orders, quote }) => {
    return (
        <div className="h-full overflow-y-auto bg-secondary/50">
            {customer && (
                 <CollapsibleSection title="Cliente" icon={User} defaultOpen>
                    <div className="space-y-1">
                        <p className="font-bold text-textPrimary">{customer.name}</p>
                        <p>{customer.email}</p>
                        {/* FIX: Property 'phone' does not exist on type 'Contact'. Used optional chaining after updating types.ts. */}
                        <p>{customer?.phone}</p>
                        {/* FIX: Property 'address' does not exist on type 'Contact'. Used optional chaining after updating types.ts. */}
                        <p>{customer?.address?.street}, {customer?.address?.city}</p>
                    </div>
                </CollapsibleSection>
            )}

            {quote && (
                <CollapsibleSection title="Orçamento" icon={FileText} defaultOpen>
                    <div className="space-y-2">
                        {quote.items.map(item => (
                            <div key={item.id} className="flex justify-between text-xs">
                                <span>{item.quantity}x {item.productName}</span>
                                <span className="font-medium">R$ {item.total.toFixed(2)}</span>
                            </div>
                        ))}
                        <div className="border-t border-border pt-2 mt-2 space-y-1">
                             <div className="flex justify-between text-xs"><span>Subtotal:</span><span>R$ {quote.totals.subtotal.toFixed(2)}</span></div>
                             <div className="flex justify-between text-xs"><span>Frete:</span><span>R$ {quote.totals.shipping.toFixed(2)}</span></div>
                             <div className="flex justify-between text-sm font-bold text-textPrimary"><span>Total:</span><span>R$ {quote.totals.grandTotal.toFixed(2)}</span></div>
                        </div>
                        <div className="mt-3">
                           {quote.status === 'draft' && <Button size="sm" className="w-full">Enviar Orçamento</Button>}
                           {quote.status === 'sent' && <p className="text-center text-xs p-2 bg-background rounded-md">Orçamento enviado. Aguardando cliente.</p>}
                           {quote.status === 'approved' && <div className="text-center text-sm p-2 bg-green-100 text-green-800 rounded-md font-semibold flex items-center justify-center gap-2"><Check size={16}/>Aprovado</div>}
                        </div>
                    </div>
                </CollapsibleSection>
            )}

            {orders.length > 0 && (
                <CollapsibleSection title="Pedidos Anteriores" icon={Package}>
                    <div className="space-y-2">
                        {orders.slice(0, 3).map(order => (
                             <div key={order.id} className="p-2 bg-background rounded-lg text-xs">
                                <div className="flex justify-between font-medium">
                                    {/* FIX: Property 'order_number' does not exist on type 'Order'. Use 'number'. */}
                                    <span>{order.number}</span>
                                    <span>R$ {order.total.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-textSecondary mt-1">
                                     <span>{new Date(order.created_at).toLocaleDateString('pt-BR')}</span>
                                     <span className="capitalize">{order.status.replace(/_/g, ' ')}</span>
                                </div>
                             </div>
                        ))}
                    </div>
                </CollapsibleSection>
            )}

             <CollapsibleSection title="Endereços" icon={MapPin}>
                <div className="p-4 bg-background rounded-lg">
                    {/* FIX: Property 'address' does not exist on type 'Contact'. Used optional chaining after updating types.ts. */}
                    <p className="font-medium text-textPrimary">{customer?.address?.street}</p>
                    <p>{customer?.address?.city}, {customer?.address?.state} - {customer?.address?.zip}</p>
                </div>
             </CollapsibleSection>
        </div>
    );
};

export default CustomerPanel;
