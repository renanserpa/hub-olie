import React from 'react';
import { Message, MessageStatus } from '../../types';
import { cn } from '../../lib/utils';
import { Clock, Check, CheckCheck } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';


interface MessageBubbleProps {
    message: Message;
}

const MessageStatusIcon: React.FC<{ status: MessageStatus }> = ({ status }) => {
    switch (status) {
        case 'sending': return <Clock size={14} className="text-gray-400" />;
        case 'sent': return <Check size={14} className="text-gray-400" />;
        case 'delivered': return <CheckCheck size={14} className="text-gray-400" />;
        case 'read': return <CheckCheck size={14} className="text-blue-500" />;
        default: return null;
    }
};

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
    const isIncoming = message.direction === 'in';
    const isNote = message.direction === 'note';

    const time = format(new Date(message.createdAt), 'HH:mm', { locale: ptBR });

    if (isNote) {
        return (
            <div className="flex justify-center my-2">
                <div className="text-center bg-yellow-100 text-yellow-800 text-xs px-4 py-2 rounded-lg max-w-sm">
                    <p className="font-semibold">{message.authorName} deixou uma nota interna</p>
                    <p>{message.content}</p>
                    <p className="text-[10px] mt-1 opacity-70">{format(new Date(message.createdAt), 'dd MMM, HH:mm', { locale: ptBR })}</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className={cn('flex items-end gap-2', isIncoming ? 'justify-start' : 'justify-end')}>
            <div className={cn(
                'max-w-md p-3 rounded-xl',
                isIncoming ? 'bg-secondary rounded-bl-none' : 'bg-primary/20 text-textPrimary rounded-br-none'
            )}>
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <div className="flex items-center justify-end gap-1.5 mt-1.5">
                    <span className="text-xs text-textSecondary/70">{time}</span>
                    {!isIncoming && <MessageStatusIcon status={message.status} />}
                </div>
            </div>
        </div>
    );
};

export default MessageBubble;