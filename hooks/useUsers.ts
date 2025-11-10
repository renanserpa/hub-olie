import { useState, useEffect, useCallback } from 'react';
import { UserProfile } from '../types';
import { dataService } from '../services/dataService';
import { toast } from './use-toast';
import { useOlie } from '../contexts/OlieContext';

export function useUsers() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const { can } = useOlie();

    const isAdmin = can('*', 'write');

    const loadUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await dataService.getCollection<UserProfile>('profiles');
            setUsers(data);
        } catch (error) {
            toast({ title: "Erro!", description: "Não foi possível carregar os usuários.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    const saveUser = async (userData: Partial<UserProfile> & { password?: string }) => {
        if (!isAdmin) {
            toast({ title: 'Acesso Negado', description: 'Você não tem permissão para esta ação.', variant: 'destructive' });
            throw new Error('Permission denied');
        }
        
        setIsSaving(true);
        try {
            if (userData.id) {
                // Update existing user
                const { password, ...updateData } = userData;
                await dataService.updateDocument('profiles', userData.id, updateData);
                toast({ title: "Sucesso!", description: "Usuário atualizado." });
            } else {
                // Create new user
                await dataService.addUser(userData);
                toast({ title: "Sucesso!", description: "Novo usuário convidado." });
            }
            loadUsers();
        } catch (error) {
            toast({ title: "Erro!", description: (error as Error).message || "Não foi possível salvar o usuário.", variant: "destructive" });
            throw error;
        } finally {
            setIsSaving(false);
        }
    };

    return {
        users,
        isLoading,
        isSaving,
        isAdmin,
        saveUser,
        refresh: loadUsers,
    };
}