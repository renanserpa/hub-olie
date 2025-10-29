import React from 'react';
import { Conversation, Channel, Priority } from '../../types';
import { cn } from '../../lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { UserPlus, Mail } from 'lucide-react';
import { IconButton } from '../ui/IconButton';

interface ConversationCardProps {
    conversation: Conversation;
    isSelected: boolean;
    onClick: () => void;
}

const channelIcons: Record<Channel, string> = {
    whatsapp: '💬',
    instagram: '📷',
    site: '🌐'
};

const priorityClasses: Record<Priority, string> = {
    low: 'bg-gray-100',
    normal: 'bg-transparent',
    high: 'bg-orange-100',
    urgent: 'bg-red-100',
}

const safeFormatDistanceToNow = (dateValue: any) => {
    if (!dateValue) return '';
    const date = dateValue.toDate ? dateValue.toDate() : new Date(dateValue);
    if (isNaN(date.getTime())) return '';
    return formatDistanceToNow(date, { addSuffix: true, locale: ptBR });
};

const ConversationCard: React.FC<ConversationCardProps> = ({ conversation, isSelected, onClick }) => {
    
    const timeAgo = safeFormatDistanceToNow(conversation.lastMessageAt);
    
    return (
        <button
            onClick={onClick}
            className={cn(
                'w-full text-left p-3 rounded-lg transition-colors duration-150 relative group',
                isSelected ? 'bg-accent' : 'hover:bg-accent/50',
                priorityClasses[conversation.priority]
            )}
        >
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                    <span className="text-lg">{channelIcons[conversation.channel]}</span>
                    <span className="font-bold text-sm text-textPrimary truncate">{conversation.customerName}</span>
                </div>
                <span className="text-xs text-textSecondary flex-shrink-0">{timeAgo}</span>
            </div>
            <p className="text-xs text-textSecondary mt-1 truncate pr-6">{conversation.title}</p>
            <div className="flex justify-between items-center mt-2">
                <div className="flex items-center gap-1.5">
                    {conversation.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="text-[10px] bg-background border border-border px-1.5 py-0.5 rounded-full">{tag}</span>
                    ))}
                </div>
                {conversation.unreadCount > 0 && (
                     <div className="w-5 h-5 bg-primary text-white text-xs font-bold flex items-center justify-center rounded-full">
                        {conversation.unreadCount}
                     </div>
                )}
            </div>

            {/* Hover actions */}
            <div className="absolute top-1/2 right-2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <IconButton 
                    title="Atribuir a mim" 
                    className="h-7 w-7 bg-white/50 hover:bg-white"
                    onClick={(e) => { e.stopPropagation(); console.log('Assign to me clicked'); }}
                >
                    <UserPlus size={14} />
                </IconButton>
                <IconButton 
                    title="Marcar como não lido" 
                    className="h-7 w-7 bg-white/50 hover:bg-white"
                    onClick={(e) => { e.stopPropagation(); console.log('Mark as unread clicked'); }}
                >
                    <Mail size={14} />
                </IconButton>
            </div>
        </button>
    );
};

export default ConversationCard;