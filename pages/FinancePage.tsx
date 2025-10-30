import React from 'react';
import { DollarSign } from 'lucide-react';
import PlaceholderContent from '../components/PlaceholderContent';

const FinancePage: React.FC = () => {
    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                <div>
                    <div className="flex items-center gap-3">
                        <DollarSign className="text-primary" size={28} />
                        <h1 className="text-3xl font-bold text-textPrimary">Financeiro</h1>
                    </div>
                    <p className="text-textSecondary mt-1">Gerencie contas a pagar, a receber e o fluxo de caixa.</p>
                </div>
            </div>
            <PlaceholderContent
                title="Módulo Financeiro em Planejamento"
                requiredTable="finance_transactions, finance_accounts, etc."
                icon={DollarSign}
            >
                <p className="mt-1 text-sm text-textSecondary">
                    As funcionalidades de controle de transações, conciliação e relatórios financeiros (DRE, Fluxo de Caixa) estão sendo desenvolvidas.
                </p>
            </PlaceholderContent>
        </div>
    );
};

export default FinancePage;
