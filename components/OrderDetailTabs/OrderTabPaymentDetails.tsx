import React from 'react';
import { Order } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { CreditCard, Link as LinkIcon, CheckCircle, AlertCircle, Clock, DollarSign } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Badge } from '../ui/Badge';

const OrderTabPaymentDetails: React.FC<{ order: Order }> = ({ order }) => {
    const payment = order.payments;

    const statusConfig: Record<string, { label: string; icon: React.ElementType; color: string; badge: string }> = {
        paid: { label: 'Pago', icon: CheckCircle, color: 'text-green-600', badge: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200' },
        pending: { label: 'Pendente', icon: Clock, color: 'text-yellow-600', badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200' },
        failed: { label: 'Falhou', icon: AlertCircle, color: 'text-red-600', badge: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200' },
        refunded: { label: 'Reembolsado', icon: AlertCircle, color: 'text-gray-600', badge: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' },
    };

    const currentStatus = payment?.status && statusConfig[payment.status] 
        ? statusConfig[payment.status] 
        : statusConfig['pending'];
    
    const StatusIcon = currentStatus.icon;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    Informações de Pagamento
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-secondary/50 dark:bg-dark-secondary/50 rounded-lg border border-border dark:border-dark-border">
                    <div>
                        <p className="text-sm font-medium text-textSecondary dark:text-dark-textSecondary mb-1">Status Atual</p>
                        <div className="flex items-center gap-2">
                             <StatusIcon className={cn("h-5 w-5", currentStatus.color)} />
                             <span className="font-bold text-lg capitalize text-textPrimary dark:text-dark-textPrimary">{currentStatus.label}</span>
                        </div>
                    </div>
                    <Badge className={currentStatus.badge}>{payment?.status || 'Pendente'}</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <p className="text-xs uppercase tracking-wider text-textSecondary dark:text-dark-textSecondary font-semibold mb-1">Método</p>
                        <p className="font-medium text-textPrimary dark:text-dark-textPrimary">{payment?.method || 'Não definido'}</p>
                    </div>
                    <div>
                         <p className="text-xs uppercase tracking-wider text-textSecondary dark:text-dark-textSecondary font-semibold mb-1">ID da Transação</p>
                         <p className="font-mono text-sm text-textPrimary dark:text-dark-textPrimary break-all">{payment?.transactionId || '-'}</p>
                    </div>
                </div>

                 {payment?.checkoutUrl && (
                    <div className="pt-4 border-t border-border dark:border-dark-border">
                        <p className="text-xs uppercase tracking-wider text-textSecondary dark:text-dark-textSecondary font-semibold mb-2">URL de Checkout</p>
                        <div className="flex items-center gap-2 p-3 bg-background dark:bg-dark-background border border-border dark:border-dark-border rounded-md">
                            <LinkIcon size={16} className="text-primary flex-shrink-0" />
                            <a 
                                href={payment.checkoutUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-sm text-primary hover:underline truncate"
                            >
                                {payment.checkoutUrl}
                            </a>
                        </div>
                    </div>
                )}
                
                {!payment && (
                     <div className="text-center py-4 text-textSecondary dark:text-dark-textSecondary text-sm">
                        Nenhuma informação de pagamento registrada.
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default OrderTabPaymentDetails;