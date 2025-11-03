import { useState, useEffect, useCallback } from 'react';
import { Notification } from '../types';
import { dataService } from '../services/dataService';
import { toast } from './use-toast';
import { useAuth } from '../context/AuthContext';

export function useNotifications() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadData = useCallback(async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const data = await dataService.getCollection<Notification>('notifications');
            setNotifications(data.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
        } catch (error) {
            toast({ title: "Erro", description: "Não foi possível carregar as notificações.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        loadData();

        const listener = dataService.listenToCollection<Notification>('notifications', undefined, (data) => {
            setNotifications(data.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
            
            // Show a toast for new unread notifications
            const newUnread = data.find(n => !notifications.some(oldN => oldN.id === n.id) && !n.is_read);
            if(newUnread) {
                toast({ title: newUnread.title, description: newUnread.message });
            }
        });
        
        return () => listener.unsubscribe();

    }, [loadData, notifications]);

    const unreadCount = notifications.filter(n => !n.is_read).length;

    const markAsRead = async (id: string) => {
        try {
            // Optimistic update
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            await dataService.updateDocument('notifications', id, { is_read: true });
        } catch (error) {
            toast({ title: "Erro", description: "Não foi possível marcar a notificação como lida.", variant: "destructive" });
            loadData(); // Revert on error
        }
    };
    
    const markAllAsRead = async () => {
        try {
            const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
            if (unreadIds.length === 0) return;
            
            // Optimistic update
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            
            // Batch update
            await Promise.all(unreadIds.map(id => dataService.updateDocument('notifications', id, { is_read: true })));

        } catch (error) {
             toast({ title: "Erro", description: "Não foi possível marcar todas as notificações como lidas.", variant: "destructive" });
             loadData(); // Revert
        }
    };

    return {
        isLoading,
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
    };
}