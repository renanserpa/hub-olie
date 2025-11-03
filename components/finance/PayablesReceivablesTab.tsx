import React from 'react';
import { FinancePayable, FinanceReceivable } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface PayablesReceivablesTabProps {
    payables: FinancePayable[];
    receivables: FinanceReceivable[];
}

const SummaryCard: React.FC<{ title: string, data: (FinancePayable | FinanceReceivable)[], type: 'payable' | 'receivable' }> = ({ title, data, type }) => {
    const total = data.reduce((sum, item) => sum + item.amount, 0);
    const overdue = data.filter(item => new Date(item.due_date) < new Date() && item.status === 'pending');
    const Icon = type === 'receivable' ? TrendingUp : TrendingDown;
    const colorClass = type === 'receivable' ? 'text-green-600' : 'text-red-600';

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                    <Icon className={colorClass} />
                    {title}
                </CardTitle>
                <span className={cn("font-bold text-xl", colorClass)}>{total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
            </CardHeader>
            <CardContent>
                {overdue.length > 0 && (
                     <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm mb-4">
                        <p className="font-semibold flex items-center gap-2"><AlertCircle size={16}/> {overdue.length} vencido(s), totalizando {overdue.reduce((s, i) => s + i.amount, 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                    </div>
                )}
                <div className="overflow-x-auto max-h-80">
                    <table className="w-full text-sm">
                        <thead className="bg-secondary">
                            <tr>
                                <th className="p-2 font-semibold">Vencimento</th>
                                <th className="p-2 font-semibold">Referência</th>
                                <th className="p-2 font-semibold text-right">Valor</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map(item => (
                                <tr key={item.id} className="border-b">
                                    <td className="p-2">{new Date(item.due_date).toLocaleDateString('pt-BR')}</td>
                                    <td className="p-2 font-mono text-xs">{item.purchase_order_id || item.order_id}</td>
                                    <td className="p-2 text-right font-semibold">{item.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
};

const PayablesReceivablesTab: React.FC<PayablesReceivablesTabProps> = ({ payables, receivables }) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SummaryCard title="Contas a Receber" data={receivables} type="receivable" />
            <SummaryCard title="Contas a Pagar" data={payables} type="payable" />
        </div>
    );
};

export default PayablesReceivablesTab;