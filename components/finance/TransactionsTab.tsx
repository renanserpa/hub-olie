import React from 'react';
import { FinanceTransaction } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Plus, ArrowRightLeft } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Badge } from '../ui/Badge';

interface TransactionsTabProps {
    transactions: FinanceTransaction[];
    onNewClick: () => void;
    onEditClick: (t: FinanceTransaction) => void;
}

const EmptyState: React.FC = () => (
    <div className="text-center text-textSecondary dark:text-dark-textSecondary py-16 border-2 border-dashed border-border dark:border-dark-border rounded-xl">
        <ArrowRightLeft className="mx-auto h-12 w-12 text-textSecondary/60 dark:text-dark-textSecondary/60" />
        <h3 className="mt-4 text-lg font-medium text-textPrimary dark:text-dark-textPrimary">Nenhuma Transação</h3>
        <p className="mt-1 text-sm text-textSecondary dark:text-dark-textSecondary">Comece adicionando uma nova transação para ver os registros aqui.</p>
    </div>
);

const TransactionsTab: React.FC<TransactionsTabProps> = ({ transactions, onNewClick, onEditClick }) => {
    const formatDate = (date: string) => new Date(date).toLocaleDateString('pt-BR');

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Extrato de Transações</CardTitle>
                <Button onClick={onNewClick}><Plus className="w-4 h-4 mr-2" />Nova Transação</Button>
            </CardHeader>
            <CardContent>
                {transactions.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-secondary dark:bg-dark-secondary">
                                <tr>
                                    <th className="p-4 font-semibold text-textSecondary dark:text-dark-textSecondary">Data</th>
                                    <th className="p-4 font-semibold text-textSecondary dark:text-dark-textSecondary">Descrição</th>
                                    <th className="p-4 font-semibold text-textSecondary dark:text-dark-textSecondary">Categoria</th>
                                    <th className="p-4 font-semibold text-textSecondary dark:text-dark-textSecondary">Conta</th>
                                    <th className="p-4 font-semibold text-textSecondary dark:text-dark-textSecondary text-right">Valor</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map(t => (
                                    <tr key={t.id} onClick={() => onEditClick(t)} className="cursor-pointer border-b border-border dark:border-dark-border hover:bg-accent/50 dark:hover:bg-dark-accent/50">
                                        <td className="p-4 whitespace-nowrap">{formatDate(t.transaction_date)}</td>
                                        <td className="p-4 font-medium text-textPrimary dark:text-dark-textPrimary">{t.description}</td>
                                        <td className="p-4">
                                            <Badge variant="secondary">{t.category?.name || 'N/A'}</Badge>
                                        </td>
                                        <td className="p-4 text-textSecondary dark:text-dark-textSecondary">{t.account?.name || 'N/A'}</td>
                                        <td className={cn(
                                            "p-4 font-semibold text-right font-mono",
                                            t.amount >= 0 ? 'text-green-600' : 'text-red-600'
                                        )}>
                                            {t.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default TransactionsTab;
