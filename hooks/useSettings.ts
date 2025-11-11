import { useState, useEffect, useCallback } from 'react';
import { AppData, AnySettingsItem, SettingsCategory, SystemSetting } from '../types';
import { dataService } from '../services/dataService';
import { toast } from './use-toast';
import { useApp } from '../contexts/AppContext';
// FIX: Correct the import to use 'mediaService' which provides the upload functionality, and alias it to 'storageService' to avoid further changes.
import { mediaService } from '../services/mediaService';

export function useSettings() {
    const { user } = useApp();
    const [settingsData, setSettingsData] = useState<AppData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const isAdmin = user?.role === 'AdminGeral' || user?.role === 'Administrativo';

    const loadSettings = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await dataService.getSettings();
            setSettingsData(data);
        } catch (error) {
            toast({ title: "Erro!", description: "Não foi possível carregar as configurações.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadSettings();
        
        const listener = dataService.listenToCollection<SystemSetting>('system_settings', undefined, (updatedSettings) => {
            console.log("Realtime update for system_settings received!");
            setSettingsData(prevData => {
                if (!prevData) return null;
                return { ...prevData, sistema: updatedSettings };
            });
        });
        
        return () => listener.unsubscribe();

    }, [loadSettings]);
    
    const performMutation = async (
        mutationFn: Promise<any>,
        successMessage: string,
        errorMessage: string
    ) => {
        if (!isAdmin) {
            toast({ title: 'Acesso Negado', description: 'Você não tem permissão para esta ação.', variant: 'destructive' });
            throw new Error('Permission denied');
        }
        try {
            await mutationFn;
            toast({ title: 'Sucesso!', description: successMessage });
            await loadSettings();
        } catch (error) {
            console.error(errorMessage, error);
            const errorMsg = (error as Error).message || errorMessage;
            toast({ title: 'Erro!', description: errorMsg, variant: 'destructive' });
            throw error; // Re-throw so components know the submission failed
        }
    };

    // FIX: Add module and category parameters to pass to the upload service.
    const uploadFilesAndUpdateItem = async (item: any, fileData: Record<string, File | null> | undefined, module: SettingsCategory, uploadCategory: string) => {
        const itemToSubmit = { ...item };
        if (!fileData) return itemToSubmit;

        for (const key in fileData) {
            const file = fileData[key];
            if (file) {
                toast({ title: "Enviando arquivo...", description: `Enviando ${file.name}` });
                // FIX: Pass all required arguments to uploadFile and use the correct return property 'webViewLink'.
                const result = await mediaService.uploadFile(file, module, uploadCategory); 
                itemToSubmit[key] = result.webViewLink;
            }
        }
        return itemToSubmit;
    };

    const handleAdd = async (category: SettingsCategory, item: Omit<AnySettingsItem, 'id'>, subTab: string | null, subSubTab: string | null, fileData?: Record<string, File | null>) => {
        // FIX: Pass module and category info to the uploader function.
        const uploadCategory = subSubTab || subTab || 'default';
        const processedItem = await uploadFilesAndUpdateItem(item, fileData, category, uploadCategory);
        return performMutation(
            dataService.addSetting(category, processedItem, subTab, subSubTab),
            'Item adicionado com sucesso.',
            'Falha ao adicionar o item.'
        );
    };

    const handleUpdate = async (category: SettingsCategory, item: AnySettingsItem, subTab: string | null, subSubTab: string | null, fileData?: Record<string, File | null>) => {
        // FIX: Pass module and category info to the uploader function.
        const uploadCategory = subSubTab || subTab || 'default';
        const processedItem = await uploadFilesAndUpdateItem(item, fileData, category, uploadCategory);
        return performMutation(
            dataService.updateSetting(category, processedItem.id, processedItem, subTab, subSubTab),
            'Item atualizado com sucesso.',
            'Falha ao atualizar o item.'
        );
    };
    
    const handleDelete = (category: SettingsCategory, itemId: string, subTab: string | null, subSubTab: string | null) => {
         return performMutation(
            dataService.deleteSetting(category, itemId, subTab, subSubTab),
            'Item excluído com sucesso.',
            'Falha ao excluir o item.'
         );
    };


    return {
        settingsData,
        isLoading,
        isAdmin,
        handleAdd,
        handleUpdate,
        handleDelete,
        refresh: loadSettings
    };
}
