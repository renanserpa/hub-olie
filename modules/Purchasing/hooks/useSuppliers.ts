// modules/Purchasing/hooks/useSuppliers.ts
import { useState, useEffect } from 'react';
import { Supplier } from '../../../types';
import { dataService } from '../../../services/dataService';
import { toast } from '../../../hooks/use-toast';
import { useOlie } from '../../../contexts/OlieContext';

export function useSuppliers() {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const { can } = useOlie();

    const canWrite = can('Purchases', 'write') || can('Settings', 'write');

    useEffect(() => {
        setIsLoading(true);
        const listener = dataService.listenToCollection<Supplier>('suppliers', undefined, (newSuppliers) => {
            setSuppliers(newSuppliers.sort((a, b) => a.name.localeCompare(b.name)));
            setIsLoading(false);
        }, setSuppliers);
        return () => listener.unsubscribe();
    }, []);


    const saveSupplier = async (supplierData: Omit<Supplier, 'id' | 'created_at' | 'updated_at'> | Supplier) => {
        if (!canWrite) {
            toast({ title: 'Acesso Negado', description: 'Você não tem permissão para esta ação.', variant: 'destructive' });
            throw new Error('Permission denied');
        }
        setIsSaving(true);
        try {
            if ('id' in supplierData && supplierData.id) {
                await dataService.updateDocument('suppliers', supplierData.id, supplierData);
                toast({ title: "Sucesso!", description: "Fornecedor atualizado." });
            } else {
                await dataService.addDocument('suppliers', supplierData as Omit<Supplier, 'id'>);
                toast({ title: "Sucesso!", description: "Novo fornecedor criado." });
            }
        } catch (error) {
            toast({ title: "Erro!", description: "Não foi possível salvar o fornecedor.", variant: "destructive" });
            throw error;
        } finally {
            setIsSaving(false);
        }
    };
    
    const deleteSupplier = async (id: string) => {
         if (!canWrite) {
            toast({ title: 'Acesso Negado', description: 'Você não tem permissão para esta ação.', variant: 'destructive' });
            throw new Error('Permission denied');
        }
        setIsSaving(true);
        try {
            await dataService.deleteDocument('suppliers', id);
            toast({ title: "Sucesso!", description: "Fornecedor excluído." });
        } catch (error) {
             toast({ title: "Erro!", description: "Não foi possível excluir o fornecedor.", variant: "destructive" });
            throw error;
        } finally {
            setIsSaving(false);
        }
    };

    return {
        suppliers,
        isLoading,
        isSaving,
        canWrite,
        saveSupplier,
        deleteSupplier,
    };
}