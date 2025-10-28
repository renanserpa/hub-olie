
import React, { useState, useEffect } from 'react';
import { Order, ConfigJson } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { ArrowLeft, CreditCard, FileText, Truck, RefreshCw, Palette, Type } from 'lucide-react';
import { useTinyApi } from '../hooks/useTinyApi';
import { toast } from '../hooks/use-toast';
import { supabaseService } from '../services/firestoreService';

interface OrderDetailProps {
  order: Order;
  onClose: () => void;
  onUpdate: () => void;
}

const CustomizationDetail: React.FC<{ config: ConfigJson }> = ({ config }) => {
    const details = [];
    if (config.fabricColor) details.push({ icon: Palette, label: 'Tecido', value: config.fabricColor });
    if (config.zipperColor) details.push({ icon: Palette, label: 'Zíper', value: config.zipperColor });
    if (config.embroidery?.enabled) {
        details.push({ icon: Type, label: 'Bordado', value: `${config.embroidery.text} (${config.embroidery.font.split(' ')[0]})` });
    }
    if (config.notes) details.push({ icon: FileText, label: 'Obs', value: config.notes });

    if (details.length === 0) return null;

    return (
        <div className="mt-2 pl-4 border-l-2 border-primary/20 space-y-1">
            {details.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-2 text-xs text-textSecondary">
                    <Icon size={12} />
                    <span className="font-medium">{label}:</span>
                    <span>{value}</span>
                </div>
            ))}
        </div>
    );
};

const OrderDetail: React.FC<OrderDetailProps> = ({ order: initialOrder, onClose, onUpdate }) => {
    const [order, setOrder] = useState(initialOrder);
    const [activeTab, setActiveTab] = useState('payments');
    const tinyApi = useTinyApi();
    
    useEffect(() => {
        // Update local state if the initial prop changes (e.g., from parent's real-time update)
        setOrder(initialOrder);
    }, [initialOrder]);

    useEffect(() => {
        const listener = supabaseService.listenToDocument<Order>('orders', initialOrder.id, async () => {
            // When an update is detected for this specific order, refetch it with the contact join
            const updatedOrderData = await supabaseService.getOrder(initialOrder.id);
            if (updatedOrderData) {
                setOrder(updatedOrderData);
            }
        });

        return () => {
            listener.unsubscribe();
        };
    }, [initialOrder.id]);


    const handleUpdate = async (field: 'payments' | 'fiscal' | 'logistics', data: any) => {
        const updatedOrder = await supabaseService.updateOrder(order.id, { [field]: data });
        // No need for setOrder here, listener will catch the change. onUpdate is also redundant now but kept for compatibility.
        onUpdate();
        return updatedOrder;
    };

    const handleCreatePaymentLink = async () => {
        if (!order.contact) return;
        const result = await tinyApi.createPaymentLink(order.id, order.total, `Pedido ${order.order_number}`, order.contact);
        if (result) {
            await handleUpdate('payments', result.payments);
            toast({ title: "Sucesso!", description: "Link de pagamento gerado." });
            window.open(result.payments.checkoutUrl, '_blank');
        }
    };

    const handleIssueNFe = async () => {
        const result = await tinyApi.issueNFe(order.id);
        if(result) {
            await handleUpdate('fiscal', result.fiscal);
            toast({ title: "Sucesso!", description: "Nota Fiscal emitida." });
        }
    };
    
    const handleCreateLabel = async () => {
        const result = await tinyApi.createShippingLabel(order.id);
         if(result) {
            await handleUpdate('logistics', result.logistics);
            toast({ title: "Sucesso!", description: "Etiqueta de envio gerada." });
            window.open(result.logistics.labelUrl, '_blank');
        }
    };

    const TABS = [
        { id: 'payments', label: 'Pagamentos', icon: CreditCard },
        { id: 'fiscal', label: 'Fiscal (NFe)', icon: FileText },
        { id: 'logistics', label: 'Frete', icon: Truck },
    ];

    return (
        <div>
            <Button variant="ghost" onClick={onClose} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" /> Voltar para Pedidos</Button>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Detalhes do Pedido #{order.order_number}</CardTitle>
                        </CardHeader>
                        <CardContent>
                           <div className="border-b border-border">
                               <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                                   {TABS.map(tab => (
                                       <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                           className={`flex items-center gap-2 whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-sm focus:outline-none ${activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-textSecondary hover:text-textPrimary'}`}
                                       ><tab.icon size={16} />{tab.label}</button>
                                   ))}
                               </nav>
                           </div>
                           <div className="pt-6">
                               {activeTab === 'payments' && (
                                    <div className="space-y-4">
                                        <p>Status: <span className="font-semibold">{order.payments?.status || 'Pendente'}</span></p>
                                        <Button onClick={handleCreatePaymentLink} disabled={tinyApi.loading}>
                                            {tinyApi.loading && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
                                            {order.payments?.checkoutUrl ? 'Recriar Link' : 'Gerar Link de Pagamento'}
                                        </Button>
                                    </div>
                               )}
                               {activeTab === 'fiscal' && (
                                    <div className="space-y-4">
                                         <p>Status: <span className="font-semibold">{order.fiscal?.status || 'Pendente'}</span></p>
                                        <Button onClick={handleIssueNFe} disabled={tinyApi.loading}>
                                            {tinyApi.loading && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
                                            Emitir NFe
                                        </Button>
                                        {order.fiscal?.pdfUrl && <Button variant="outline" onClick={() => window.open(order.fiscal!.pdfUrl!, '_blank')}>Ver DANFE</Button>}
                                    </div>
                               )}
                               {activeTab === 'logistics' && (
                                   <div className="space-y-4">
                                        <p>Status: <span className="font-semibold">{order.logistics?.status || 'Pendente'}</span></p>
                                        <Button onClick={handleCreateLabel} disabled={tinyApi.loading}>
                                            {tinyApi.loading && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
                                            Gerar Etiqueta de Envio
                                        </Button>
                                        {order.logistics?.tracking && <p>Rastreio: <span className="font-semibold">{order.logistics.tracking}</span></p>}
                                    </div>
                               )}
                           </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader><CardTitle>Cliente</CardTitle></CardHeader>
                        <CardContent>
                            <p className="font-semibold">{order.contact?.name}</p>
                            <p className="text-sm text-textSecondary">{order.contact?.email}</p>
                            <p className="text-sm text-textSecondary">{order.contact?.phone}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Itens</CardTitle></CardHeader>
                        <CardContent>
                            {order.items.map(item => (
                                <div key={item.id} className="border-b last:border-b-0 py-2">
                                    <p className="font-medium">{item.quantity}x {item.product_name}</p>
                                    <p className="text-sm text-textSecondary">R$ {item.total.toFixed(2)}</p>
                                    {item.config_json && <CustomizationDetail config={item.config_json} />}
                                </div>
                            ))}
                            <div className="border-t mt-2 pt-2 space-y-1 text-sm">
                                <p className="flex justify-between"><span>Subtotal:</span> <span>R$ {order.subtotal.toFixed(2)}</span></p>
                                <p className="flex justify-between"><span>Frete:</span> <span>R$ {order.shipping_cost.toFixed(2)}</span></p>
                                <p className="flex justify-between font-bold text-base"><span>Total:</span> <span>R$ {order.total.toFixed(2)}</span></p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default OrderDetail;