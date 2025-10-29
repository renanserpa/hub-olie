import React, { useState } from 'react';
import { Order } from '../types';
import { X, List, CreditCard, Clock, FileText, ShoppingBag } from 'lucide-react';
import { Button } from './ui/Button';
import { cn } from '../lib/utils';
import OrderTabDetails from './OrderDetailTabs/OrderTabDetails';
import OrderTabItems from './OrderDetailTabs/OrderTabItems';
import OrderTabPayments from './OrderDetailTabs/OrderTabPayments';
import OrderTabTimeline from './OrderDetailTabs/OrderTabTimeline';
import { useTinyApi } from '../hooks/useTinyApi';


interface OrderDrawerProps {
    order: Order | null;
    isOpen: boolean;
    onClose: () => void;
}

const TABS = [
    { id: 'details', label: 'Detalhes', icon: List },
    { id: 'items', label: 'Itens', icon: ShoppingBag },
    { id: 'payments', label: 'Pagamentos', icon: CreditCard },
    { id: 'timeline', label: 'Timeline', icon: Clock },
];

const OrderDrawer: React.FC<OrderDrawerProps> = ({ order, isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState('details');
    const tinyApi = useTinyApi();
    
    // Reset tab when a new order is opened
    React.useEffect(() => {
        if (isOpen) {
            setActiveTab('details');
        }
    }, [isOpen, order?.id]);
    
    if (!order) return null;

    const renderTabContent = () => {
        switch(activeTab) {
            case 'details': return <OrderTabDetails order={order} />;
            case 'items': return <OrderTabItems order={order} />;
            case 'payments': return <OrderTabPayments order={order} tinyApi={tinyApi} />;
            case 'timeline': return <OrderTabTimeline order={order} />;
            default: return null;
        }
    };

    return (
        <div 
            className={cn(
                "fixed inset-0 bg-black/60 z-40 transition-opacity",
                isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
            onClick={onClose}
        >
            <div 
                className={cn(
                    "fixed top-0 right-0 h-full w-full max-w-2xl bg-card shadow-lg flex flex-col transition-transform duration-300",
                    isOpen ? "translate-x-0" : "translate-x-full"
                )}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-border flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-textPrimary">Pedido {order.number}</h2>
                        <p className="text-sm text-textSecondary">Cliente: {order.customers?.name}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose}><X /></Button>
                </div>
                
                {/* Tabs */}
                <div className="p-2 border-b border-border flex-shrink-0">
                    <nav className="flex space-x-2">
                        {TABS.map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                className={cn('flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-colors',
                                    activeTab === tab.id ? 'bg-accent text-primary' : 'text-textSecondary hover:bg-accent/50')}>
                                <tab.icon size={16} />
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {renderTabContent()}
                </div>
            </div>
        </div>
    );
};

export default OrderDrawer;