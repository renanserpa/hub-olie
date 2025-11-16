import { useState, useEffect, useCallback, useRef } from 'react';
import { Notification } from '../types';
import { dataService } from '../services/dataService';
import { toast } from './use-toast';
import { useApp } from '../contexts/AppContext';

export function useNotifications() {
    const { user } = useApp();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const prevNotificationsRef = useRef<Notification[] | undefined>(undefined);
    
    useEffect(() => {
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
            setNotifications(sortedData); // This is handled by the service now, but keep for the logic above
            setIsLoading(false);
        };
        
        const listener = dataService.listenToCollection<Notification>('notifications', undefined, setNotifications, handleData);
        
        return () => listener.unsubscribe();

    }, [user?.id]);

    const unreadCount = notifications.filter(n => !n.is_read).length;

    const markAsRead = useCallback(async (id: string) => {
        const originalNotifications = notifications;
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        try {
            await dataService.updateDocument<Notification>('notifications', id, { is_read: true });
        } catch (error) {
            toast({ title: "Erro", description: "Não foi possível marcar a notificação como lida.", variant: "destructive" });
            setNotifications(originalNotifications);
        }
    }, [notifications]);
    
    const markAllAsRead = useCallback(async () => {
        const originalNotifications = notifications;
        const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
        if (unreadIds.length === 0) return;
        
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        
        try {
            await Promise.all(unreadIds.map(id => dataService.updateDocument<Notification>('notifications', id, { is_read: true })));
        } catch (error) {
             toast({ title: "Erro", description: "Não foi possível marcar todas as notificações como lidas.", variant: "destructive" });
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