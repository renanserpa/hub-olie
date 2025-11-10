import { useState, useEffect, useCallback } from 'react';
import { ProductCategory } from '../types';
import { dataService } from '../services/dataService';
import { toast } from './use-toast';

export function useCategories() {
    const [categories, setCategories] = useState<ProductCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await dataService.getCollection<ProductCategory>('product_categories');
            setCategories(data);
        } catch (error) {
            toast({ title: "Erro!", description: "Não foi possível carregar as categorias.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
        const listener = dataService.listenToCollection<ProductCategory>('product_categories', undefined, (newData) => {
            setCategories(newData);
        });
        return () => listener.unsubscribe();
    }, [loadData]);

    const handleMutation = async (mutationFn: Promise<any>, successMsg: string) => {
        try {
            await mutationFn;
            toast({ title: "Sucesso!", description: successMsg });
        } catch (e) {
            toast({ title: "Erro!", description: (e as Error).message, variant: "destructive" });
            throw e;
        }
    };
    
    const addCategory = (item: Omit<ProductCategory, 'id'>) => handleMutation(dataService.addDocument('product_categories', item), `Categoria adicionada.`);
    const updateCategory = (item: ProductCategory) => handleMutation(dataService.updateDocument('product_categories', item.id, item), `Categoria atualizada.`);
    const deleteCategory = (id: string) => handleMutation(dataService.deleteDocument('product_categories', id), `Categoria excluída.`);

    return {
        categories,
        isLoading,
        addCategory,
        updateCategory,
        deleteCategory,
    };
}
