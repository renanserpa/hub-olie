import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { Bell, CheckCheck } from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from './ui/Button';

const NotificationBell: React.FC = () => {
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const toggleDropdown = () => setIsOpen(prev => !prev);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleMarkAsRead = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        markAsRead(id);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={toggleDropdown}
                className="relative text-textSecondary dark:text-dark-textSecondary hover:text-textPrimary dark:hover:text-dark-textPrimary"
                aria-label={`Notificações (${unreadCount} não lidas)`}
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 origin-top-right rounded-xl bg-card dark:bg-dark-card shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none animate-fade-in-up" style={{ animationDuration: '0.2s' }}>
                    <div className="p-2">
                        <div className="flex justify-between items-center px-2 py-1">
                            <h3 className="font-semibold">Notificações</h3>
                            {unreadCount > 0 && <Button variant="ghost" size="sm" className="text-xs" onClick={markAllAsRead}>Marcar todas como lidas</Button>}
                        </div>
                        <div className="max-h-96 overflow-y-auto mt-2">
                            {notifications.length === 0 ? (
                                <p className="text-center text-sm text-textSecondary py-8">Nenhuma notificação</p>
                            ) : (
                                notifications.map(n => (
                                    <div key={n.id} className={cn(
                                        "p-2 rounded-lg hover:bg-accent dark:hover:bg-dark-accent",
                                        !n.is_read && "bg-primary/5 dark:bg-primary/10"
                                    )}>
                                        <p className="font-medium text-sm">{n.title}</p>
                                        <p className="text-xs text-textSecondary">{n.message}</p>
                                        {!n.is_read && (
                                            <button onClick={(e) => handleMarkAsRead(e, n.id)} className="text-xs text-primary hover:underline mt-1 flex items-center gap-1">
                                               <CheckCheck size={12}/> Marcar como lida
                                            </button>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;