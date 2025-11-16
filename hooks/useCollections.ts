import { useState, useEffect, useCallback } from 'react';
import { Collection } from '../types';
import { dataService } from '../services/dataService';
import { toast } from './use-toast';

export function useCollections() {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        const listener = dataService.listenToCollection<Collection>('collections', undefined, setCollections, (newData) => {
            setIsLoading(false);
        });
        return () => listener.unsubscribe();
    }, []);

    const handleMutation = async (mutationFn: Promise<any>, successMsg: string) => {
        try {
            await mutationFn;
            toast({ title: "Sucesso!", description: successMsg });
        } catch (e) {
            toast({ title: "Erro!", description: (e as Error).message, variant: "destructive" });
            throw e;
        }
    };
    
    const addCollection = (item: Omit<Collection, 'id'>) => handleMutation(dataService.addDocument('collections', item), `Coleção adicionada.`);
    const updateCollection = (item: Collection) => handleMutation(dataService.updateDocument('collections', item.id, item), `Coleção atualizada.`);
    const deleteCollection = (id: string) => handleMutation(dataService.deleteDocument('collections', id), `Coleção excluída.`);

    return {
        collections,
        isLoading,
        addCollection,
        updateCollection,
        deleteCollection,
    };
}