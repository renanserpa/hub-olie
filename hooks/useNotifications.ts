import { useState, useEffect, useCallback, useRef } from 'react';
import { Notification } from '../types';
import { dataService } from '../services/dataService';
import { toast } from './use-toast';
import { useApp } from '../contexts/AppContext';

export function useNotifications() {
    const { user } = useApp();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    // FIX: The useRef hook was called without an initial value, which is not allowed by some TypeScript configurations when a generic type is provided. Initializing it with 'undefined' resolves the error.
    const prevNotificationsRef = useRef<Notification[] | undefined>(undefined);
    
    useEffect(() => {
        // Keep the ref updated with the latest notifications state on every render
        prevNotificationsRef.current = notifications;
    });

    useEffect(() => {
        if (!user) {
            setNotifications([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        
        const handleData = (data: Notification[]) => {
            const sortedData = data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            
            const prevNotifications = prevNotificationsRef.current;
            if (prevNotifications && prevNotifications.length > 0) {
                const newUnread = sortedData.find(n => !n.is_read && !prevNotifications.some(old => old.id === n.id));
                if (newUnread) {
                    toast({ title: newUnread.title, description: newUnread.message });
                }
            }
            setNotifications(sortedData);
            setIsLoading(false);
        };
        
        const listener = dataService.listenToCollection<Notification>('notifications', undefined, handleData);
        
        return () => listener.unsubscribe();

    }, [user?.id]); // Dependency is now on the stable user ID primitive

    const unreadCount = notifications.filter(n => !n.is_read).length;

    const markAsRead = useCallback(async (id: string) => {
        const originalNotifications = notifications;
        // Optimistic update
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        try {
            await dataService.updateDocument<Notification>('notifications', id, { is_read: true });
        } catch (error) {
            toast({ title: "Erro", description: "Não foi possível marcar a notificação como lida.", variant: "destructive" });
            // Revert on error
            setNotifications(originalNotifications);
        }
    }, [notifications]);
    
    const markAllAsRead = useCallback(async () => {
        const originalNotifications = notifications;
        const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
        if (unreadIds.length === 0) return;
        
        // Optimistic update
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        
        try {
            // Batch update
            await Promise.all(unreadIds.map(id => dataService.updateDocument<Notification>('notifications', id, { is_read: true })));
        } catch (error) {
             toast({ title: "Erro", description: "Não foi possível marcar todas as notificações como lidas.", variant: "destructive" });
             // Revert
             setNotifications(originalNotifications);
        }
    }, [notifications]);

    return {
        isLoading,
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
    };
}
