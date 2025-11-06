import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { Button } from '../ui/Button';
import { FinanceTransaction, FinanceAccount, FinanceCategory } from '../../types';
import { Loader2 } from 'lucide-react';
import { toast } from '../../hooks/use-toast';

interface TransactionDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Omit<FinanceTransaction, 'id' | 'created_at'> | FinanceTransaction) => Promise<void>;
    transaction: FinanceTransaction | null;
    accounts: FinanceAccount[];
    categories: FinanceCategory[];
}

const TransactionDialog: React.FC<TransactionDialogProps> = ({ isOpen, onClose, onSave, transaction, accounts, categories }) => {
    const [formData, setFormData] = useState<Partial<FinanceTransaction>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (transaction) {
            setFormData({
                ...transaction,
                transaction_date: new Date(new Date(transaction.transaction_date).getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 10)
            });
        } else {
            setFormData({
                description: '',
                amount: 0,
                type: 'expense',
                transaction_date: new Date().toISOString().slice(0, 10),
                status: 'cleared',
                account_id: accounts[0]?.id || '',
                category_id: '',
            });
        }
    }, [transaction, isOpen, accounts]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const new_data = { ...prev, [name]: value };
            if (name === 'amount' || name === 'type') {
                const amount = name === 'amount' ? parseFloat(value) : new_data.amount;
                const type = name === 'type' ? value : new_data.type;
                if (type === 'income') {
                    new_data.amount = Math.abs(amount || 0);
                } else {
                    new_data.amount = -Math.abs(amount || 0);
                }
            }
            return new_data;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.description || !formData.account_id || !formData.category_id) {
            toast({ title: "Atenção", description: "Preencha todos os campos obrigatórios.", variant: 'destructive' });
            return;
        }

        setIsSubmitting(true);
        try {
            await onSave(formData as FinanceTransaction);
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputStyle = "mt-1 w-full px-3 py-2 border border-border dark:border-dark-border rounded-xl shadow-sm bg-background dark:bg-dark-background focus:outline-none focus:ring-2 focus:ring-primary/50";
    const labelStyle = "block text-sm font-medium text-textSecondary dark:text-dark-textSecondary";

    const incomeCategories = categories.filter(c => c.type === 'income');
    const expenseCategories = categories.filter(c => c.type === 'expense');
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={transaction ? "Editar Transação" : "Nova Transação"}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className={labelStyle}>Descrição *</label>
                    <input name="description" value={formData.description || ''} onChange={handleChange} required className={inputStyle} />
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className={labelStyle}>Tipo *</label>
                        <select name="type" value={formData.type} onChange={handleChange} required className={inputStyle}>
                            <option value="expense">Despesa</option>
                            <option value="income">Receita</option>
                        </select>
                    </div>
                    <div className="col-span-2">
                        <label className={labelStyle}>Valor (R$) *</label>
                        <input name="amount" type="number" step="0.01" value={Math.abs(formData.amount || 0)} onChange={handleChange} required className={inputStyle} />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelStyle}>Conta *</label>
                        <select name="account_id" value={formData.account_id || ''} onChange={handleChange} required className={inputStyle}>
                            <option value="">Selecione</option>
                            {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className={labelStyle}>Categoria *</label>
                        <select name="category_id" value={formData.category_id || ''} onChange={handleChange} required className={inputStyle}>
                            <option value="">Selecione</option>
                            <optgroup label="Receitas">
                                {incomeCategories.map(cat => <option key={cat.id} value={cat.id} disabled={formData.type !== 'income'}>{cat.name}</option>)}
                            </optgroup>
                            <optgroup label="Despesas">
                                {expenseCategories.map(cat => <option key={cat.id} value={cat.id} disabled={formData.type !== 'expense'}>{cat.name}</option>)}
                            </optgroup>
                        </select>
                    </div>
                </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelStyle}>Data da Transação *</label>
                        <input name="transaction_date" type="date" value={formData.transaction_date || ''} onChange={handleChange} required className={inputStyle} />
                    </div>
                     <div>
                        <label className={labelStyle}>Status *</label>
                        <select name="status" value={formData.status || ''} onChange={handleChange} required className={inputStyle}>
                            <option value="cleared">Conciliado</option>
                            <option value="pending">Pendente</option>
                            <option value="cancelled">Cancelado</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className={labelStyle}>Notas</label>
                    <textarea name="notes" value={formData.notes || ''} onChange={handleChange} rows={2} className={inputStyle} />
                </div>

                <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-border dark:border-dark-border">
                    <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Salvar Transação
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default TransactionDialog;