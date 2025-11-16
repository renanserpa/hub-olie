import { useState, useEffect, useCallback } from 'react';
import { FinanceAccount, FinanceCategory, FinanceTransaction, FinancePayable, FinanceReceivable } from '../types';
import { dataService } from '../services/dataService';
import { toast } from './use-toast';

export function useFinance() {
    const [isLoading, setIsLoading] = useState(true);
    const [accounts, setAccounts] = useState<FinanceAccount[]>([]);
    const [categories, setCategories] = useState<FinanceCategory[]>([]);
    const [transactions, setTransactions] = useState<FinanceTransaction[]>([]);
    const [payables, setPayables] = useState<FinancePayable[]>([]);
    const [receivables, setReceivables] = useState<FinanceReceivable[]>([]);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const { accounts, categories, transactions, payables, receivables } = await dataService.getFinanceData();
            
            setAccounts(accounts);
            setCategories(categories);
            setTransactions(transactions.sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime()));
            setPayables(payables);
            setReceivables(receivables);

        } catch (error) {
            toast({ title: "Erro no Módulo Financeiro", description: "Não foi possível carregar os dados.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();

        const listener = dataService.listenToCollection('finance_transactions', undefined, setTransactions, (data) => {
            console.log('Realtime update on finance_transactions detected, refreshing...');
            setTransactions(data.sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime()));
        });

        return () => listener.unsubscribe();

    }, [loadData]);
    
    const saveTransaction = async (data: Omit<FinanceTransaction, 'id' | 'created_at'> | FinanceTransaction) => {
        try {
            if ('id' in data) {
                 await dataService.updateDocument('finance_transactions', data.id, data);
                 toast({ title: "Sucesso!", description: "Transação atualizada." });
            } else {
                 await dataService.addDocument('finance_transactions', data as Omit<FinanceTransaction, 'id'>);
                 toast({ title: "Sucesso!", description: "Nova transação registrada." });
            }
            // Realtime listener will handle refresh
        } catch (error) {
            toast({ title: "Erro!", description: "Não foi possível salvar a transação.", variant: "destructive" });
            throw error;
        }
    };


    return {
        isLoading,
        accounts,
        categories,
        transactions,
        payables,
        receivables,
        saveTransaction,
    };
}