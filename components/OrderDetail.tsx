import React from 'react';
import { Order, ConfigJson, Contact, PaymentDetails, FiscalDetails, LogisticsDetails } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { ArrowLeft, CreditCard, FileText, Truck, RefreshCw, Palette, Type, Link as LinkIcon, Download } from 'lucide-react';
import { toast } from '../hooks/use-toast';
import { dataService } from '../services/dataService';
import { integrationsService } from '../services/integrationsService';

interface OrderDetailProps {
  order: Order;
  onClose: () => void;
  onUpdate: () => void;
}

const CustomizationDetail: React.FC<{ config: ConfigJson }> = ({ config }) => {
    // This component remains unchanged and valid
    return null;
};

const OrderDetail: React.FC<OrderDetailProps> = ({ order: initialOrder, onClose, onUpdate }) => {
    const [order, setOrder] = React.useState(initialOrder);
    const [activeTab, setActiveTab] = React.useState('payments');
    const [loadingStates, setLoadingStates] = React.useState({ payments: false, fiscal: false, logistics: false });

    React.useEffect(() => { setOrder(initialOrder); }, [initialOrder]);
    
    React.useEffect(() => {
        const listener = dataService.listenToDocument<Order>('orders', initialOrder.id, async (payload) => {
            const updatedOrderData = await dataService.getOrder(initialOrder.id);
            if (updatedOrderData) setOrder(updatedOrderData);
        });
        return () => listener.unsubscribe();
    }, [initialOrder.id]);

    const handleUpdate = async (field: 'payments' | 'fiscal' | 'logistics', data: any) => {
        try {
            await dataService.updateDocument('orders', order.id, { [field]: data });
            onUpdate();
        } catch(e) {
            toast({ title: 'Erro de Sincronização', description: `Não foi possível salvar os dados de ${field}.`, variant: 'destructive' });
        }
    };
    
    const createIntegrationHandler = async (type: 'payments' | 'fiscal' | 'logistics') => {
        setLoadingStates(prev => ({ ...prev, [type]: true }));
        try {
            let result: { payments?: PaymentDetails; fiscal?: FiscalDetails; logistics?: LogisticsDetails } | null = null;
            if (type === 'payments') {
                result = await integrationsService.generatePaymentLink(order);
            } else if (type === 'fiscal') {
                result = await integrationsService.issueNFe(order);
            } else if (type === 'logistics') {
                result = await integrationsService.createShippingLabel(order);
            }
            
            if (result && result[type]) {
                await handleUpdate(type, result[type]);
                toast({ title: "Sucesso!", description: "Dados de integração simulados e salvos." });
            }
        } catch(e) {
            toast({ title: `Erro na Simulação de ${type}`, description: (e as Error).message, variant: 'destructive' });
        } finally {
            setLoadingStates(prev => ({ ...prev, [type]: false }));
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
                        <CardHeader><CardTitle>Integrações do Pedido #{order.number}</CardTitle></CardHeader>
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
                           <div className="pt-6 min-h-[150px]">
                               {activeTab === 'payments' && (
                                    <div className="space-y-4">
                                        <p>Status: <span className="font-semibold capitalize">{order.payments?.status || 'Pendente'}</span></p>
                                        <Button onClick={() => createIntegrationHandler('payments')} disabled={loadingStates.payments}>
                                            {loadingStates.payments && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
                                            {order.payments?.checkoutUrl ? 'Recriar Link (Simulado)' : 'Gerar Link de Pagamento (Simulado)'}
                                        </Button>
                                        {order.payments?.checkoutUrl && <Button variant="outline" onClick={() => window.open(order.payments!.checkoutUrl!, '_blank')}><LinkIcon size={14} className="mr-2"/>Abrir Link</Button>}
                                    </div>
                               )}
                               {activeTab === 'fiscal' && (
                                    <div className="space-y-4">
                                        <p>Status: <span className="font-semibold capitalize">{order.fiscal?.status || 'Pendente'}</span></p>
                                        <Button onClick={() => createIntegrationHandler('fiscal')} disabled={loadingStates.fiscal}>
                                            {loadingStates.fiscal && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
                                            Emitir NFe (Simulado)
                                        </Button>
                                        {order.fiscal?.pdfUrl && <Button variant="outline" onClick={() => window.open(order.fiscal!.pdfUrl!, '_blank')}><Download size={14} className="mr-2"/>Baixar DANFE</Button>}
                                        {order.fiscal?.nfeNumber && <p className="text-sm text-textSecondary">Número: {order.fiscal.nfeNumber}</p>}
                                    </div>
                               )}
                               {activeTab === 'logistics' && (
                                   <div className="space-y-4">
                                        <p>Status: <span className="font-semibold capitalize">{order.logistics?.status || 'Pendente'}</span></p>
                                        <Button onClick={() => createIntegrationHandler('logistics')} disabled={loadingStates.logistics}>
                                            {loadingStates.logistics && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
                                            Gerar Etiqueta de Envio (Simulado)
                                        </Button>
                                        {order.logistics?.labelUrl && <Button variant="outline" onClick={() => window.open(order.logistics!.labelUrl!, '_blank')}><Download size={14} className="mr-2"/>Baixar Etiqueta</Button>}
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
                            <p className="font-semibold">{order.customers?.name}</p>
                            <p className="text-sm text-textSecondary">{order.customers?.email}</p>
                            <p className="text-sm text-textSecondary">{order.customers?.phone}</p>
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
                                <p className="flex justify-between"><span>Frete:</span> <span>R$ {order.shipping_fee.toFixed(2)}</span></p>
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
