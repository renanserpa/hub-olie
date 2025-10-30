import React, { useState } from 'react';
import { DollarSign, Loader2 } from 'lucide-react';
import { useFinance } from '../hooks/useFinance';
import FinanceTabs from '../components/finance/FinanceTabs';
import TransactionsTab from '../components/finance/TransactionsTab';
import PlaceholderContent from '../components/PlaceholderContent';
import { FinanceTransaction } from '../types';
import TransactionDialog from '../components/finance/TransactionDialog';

const FinancePage: React.FC = () => {
    const { isLoading, accounts, categories, transactions, saveTransaction } = useFinance();
    const [activeTab, setActiveTab] = useState('transactions');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<FinanceTransaction | null>(null);

    const openDialog = (transaction: FinanceTransaction | null = null) => {
        setEditingTransaction(transaction);
        setIsDialogOpen(true);
    };
    
    const handleSave = async (data: any) => {
        await saveTransaction(data);
        setIsDialogOpen(false);
    };

    const renderContent = () => {
        if (isLoading) {
            return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
        }

        switch (activeTab) {
            case 'transactions':
                return <TransactionsTab transactions={transactions} onNewClick={() => openDialog()} onEditClick={openDialog} />;
            case 'overview':
            case 'payables_receivables':
            case 'reports':
            case 'settings':
                return <PlaceholderContent title={`Aba "${activeTab}" em desenvolvimento`} requiredTable="" icon={DollarSign} />;
            default:
                return null;
        }
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                 <div>
                    <div className="flex items-center gap-3">
                        <DollarSign className="text-primary" size={28} />
                        <h1 className="text-3xl font-bold text-textPrimary">Financeiro</h1>
                    </div>
                    <p className="text-textSecondary mt-1">Gerencie contas, transações, e o fluxo de caixa.</p>
                </div>
            </div>
            
            <FinanceTabs activeTab={activeTab} onTabChange={setActiveTab as any} />
            
            <div className="mt-6">
                {renderContent()}
            </div>
            
            <TransactionDialog 
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                onSave={handleSave}
                transaction={editingTransaction}
                accounts={accounts}
                categories={categories}
            />
        </div>
    );
};

export default FinancePage;
