import React, { useRef, useEffect } from 'react';
import { Conversation, Message } from '../../types';
import { Badge } from '../ui/Badge';
import MessageBubble from './MessageBubble';
import Composer from './Composer';
import { Tag, CheckCircle } from 'lucide-react';
import { Button } from '../ui/Button';

interface ConversationThreadProps {
    conversation: Conversation;
    messages: Message[];
    onSendMessage: (content: string, type: 'text' | 'note') => void;
    isSending: boolean;
}

const ConversationThread: React.FC<ConversationThreadProps> = ({ conversation, messages, onSendMessage, isSending }) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-border flex justify-between items-center">
                <div>
                    <h2 className="font-bold text-textPrimary">{conversation.customerName}</h2>
                    <p className="text-xs text-textSecondary">{conversation.customerHandle}</p>
                    <div className="flex items-center gap-2 mt-1">
                        {conversation.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                                <Tag className="w-3 h-3 mr-1" />{tag}
                            </Badge>
                        ))}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Badge className="capitalize">{conversation.status}</Badge>
                    <Button variant="outline" size="sm"><CheckCircle className="w-3 h-3 mr-2" />Fechar</Button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map(msg => (
                    <MessageBubble key={msg.id} message={msg} />
                ))}
                 <div ref={messagesEndRef} />
            </div>

            {/* Composer */}
            <Composer onSendMessage={onSendMessage} isSending={isSending} />
        </div>
    );
};

export default ConversationThread;