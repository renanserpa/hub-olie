// modules/Purchasing/hooks/useSupplyGroups.ts
import { useState, useEffect, useCallback } from 'react';
import { MaterialGroup } from '../../../types';
import { dataService } from '../../../services/dataService';
import { toast } from '../../../hooks/use-toast';
import { useOlie } from '../../../contexts/OlieContext';

export function useSupplyGroups() {
    const [groups, setGroups] = useState<MaterialGroup[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const { can } = useOlie();

    const canWrite = can('Purchases', 'write') || can('Settings', 'write');

    useEffect(() => {
        setIsLoading(true);
        const listener = dataService.listenToCollection<MaterialGroup>('config_supply_groups', undefined, (newData) => {
            setGroups(newData.sort((a,b) => a.name.localeCompare(b.name)));
            setIsLoading(false);
        });
        return () => listener.unsubscribe();
    }, []);

    const saveGroup = async (groupData: Omit<MaterialGroup, 'id' | 'created_at'> | MaterialGroup) => {
        if (!canWrite) {
            toast({ title: 'Acesso Negado', description: 'Você não tem permissão para esta ação.', variant: 'destructive' });
            throw new Error('Permission denied');
        }
        setIsSaving(true);
        try {
            if ('id' in groupData && groupData.id) {
                await dataService.updateDocument('config_supply_groups', groupData.id, groupData);
                toast({ title: "Sucesso!", description: "Grupo atualizado." });
            } else {
                await dataService.addDocument('config_supply_groups', groupData as Omit<MaterialGroup, 'id'>);
                toast({ title: "Sucesso!", description: "Novo grupo criado." });
            }
        } catch (error) {
            toast({ title: "Erro!", description: "Não foi possível salvar o grupo.", variant: "destructive" });
            throw error;
        } finally {
            setIsSaving(false);
        }
    };
    
    const deleteGroup = async (id: string) => {
        if (!canWrite) {
           toast({ title: 'Acesso Negado', description: 'Você não tem permissão para esta ação.', variant: 'destructive' });
           throw new Error('Permission denied');
       }
       setIsSaving(true);
       try {
           await dataService.deleteDocument('config_supply_groups', id);
           toast({ title: "Sucesso!", description: "Grupo excluído." });
       } catch (error) {
            toast({ title: "Erro!", description: "Não foi possível excluir o grupo.", variant: "destructive" });
           throw error;
       } finally {
           setIsSaving(false);
       }
   };

    return {
        groups,
        isLoading,
        isSaving,
        canWrite,
        saveGroup,
        deleteGroup,
    };
}