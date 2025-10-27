import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { toast } from './use-toast';
import { Conversation, Message, Quote, Contact, Order, User } from '../types';
import { RealtimeChannel } from '@supabase/supabase-js';

export function useOmnichannel(user: User, allContacts: Contact[], allOrders: Order[]) {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
    const [assigneeFilter, setAssigneeFilter] = useState<'all' | 'mine' | 'unassigned'>('all');

    // Effect for initial data load and real-time subscriptions
    useEffect(() => {
        let messageChannel: RealtimeChannel;
        let conversationChannel: RealtimeChannel;

        const fetchInitialData = async () => {
            setIsLoading(true);
            try {
                const { data: convosData, error: convosError } = await supabase
                    .from('omni_conversations')
                    .select('*')
                    .order('lastMessageAt', { ascending: false });

                if (convosError) throw convosError;
                
                setConversations(convosData as Conversation[] || []);

                const firstConversation = convosData?.[0];
                if (firstConversation && !selectedConversationId) {
                    setSelectedConversationId(firstConversation.id);
                }
            } catch (error) {
                console.error("Error fetching initial data:", error);
                toast({ title: 'Erro!', description: 'Não foi possível carregar as conversas.', variant: 'destructive' });
            } finally {
                setIsLoading(false);
            }
        };

        fetchInitialData();

        // Subscribe to new messages
        messageChannel = supabase.channel('omni_messages_realtime')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'omni_messages' },
                (payload) => {
                    const newMessage = payload.new as Message;
                    
                    // Add message if it belongs to the currently viewed conversation
                    if (newMessage.conversationId === selectedConversationId) {
                        setMessages(currentMessages => [...currentMessages, newMessage].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()));
                    }

                    // Update conversation list
                    setConversations(currentConvos => {
                        const convoIndex = currentConvos.findIndex(c => c.id === newMessage.conversationId);
                        if (convoIndex === -1) return currentConvos;

                        const updatedConvo = {
                            ...currentConvos[convoIndex],
                            lastMessageAt: newMessage.createdAt,
                            unreadCount: newMessage.conversationId === selectedConversationId ? 0 : (currentConvos[convoIndex].unreadCount || 0) + 1,
                        };
                        
                        const otherConvos = currentConvos.filter(c => c.id !== newMessage.conversationId);
                        return [updatedConvo, ...otherConvos];
                    });

                    if (newMessage.direction === 'in' && newMessage.conversationId !== selectedConversationId) {
                        toast({ title: "Nova Mensagem", description: `de ${newMessage.authorName}` });
                    }
                }
            ).subscribe();

        // Subscribe to conversation changes
        conversationChannel = supabase.channel('omni_conversations_realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'omni_conversations' },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setConversations(currentConvos => [payload.new as Conversation, ...currentConvos]);
                    }
                    if (payload.eventType === 'UPDATE') {
                        setConversations(currentConvos => currentConvos.map(c => c.id === payload.new.id ? payload.new as Conversation : c));
                    }
                    if (payload.eventType === 'DELETE') {
                        setConversations(currentConvos => currentConvos.filter(c => c.id !== (payload.old as any).id));
                    }
                }
            ).subscribe();

        return () => {
            if (messageChannel) supabase.removeChannel(messageChannel);
            if (conversationChannel) supabase.removeChannel(conversationChannel);
        };
    }, [selectedConversationId]);

    // Effect to fetch messages when conversation changes
    useEffect(() => {
        const fetchMessages = async () => {
            if (!selectedConversationId) {
                setMessages([]);
                return;
            };

            try {
                const { data: messagesData, error: messagesError } = await supabase
                    .from('omni_messages')
                    .select('*')
                    .eq('conversationId', selectedConversationId)
                    .order('createdAt', { ascending: true });

                if (messagesError) throw messagesError;
                setMessages(messagesData as Message[] || []);

            } catch (error) {
                 console.error("Error fetching messages:", error);
                 toast({ title: 'Erro!', description: 'Não foi possível carregar as mensagens.', variant: 'destructive' });
            }
        };

        fetchMessages();
    }, [selectedConversationId]);

    const filteredConversations = useMemo(() => {
        let convos = [...conversations];
        if (assigneeFilter === 'mine') return convos.filter(c => c.assigneeId === user.uid);
        if (assigneeFilter === 'unassigned') return convos.filter(c => !c.assigneeId);
        return convos;
    }, [conversations, assigneeFilter, user.uid]);

    const selectedConversation = useMemo(() => {
        return conversations.find(c => c.id === selectedConversationId) || null;
    }, [conversations, selectedConversationId]);

    const customerInfo = useMemo(() => {
        if (!selectedConversation) return null;
        return allContacts.find(c => c.id === selectedConversation.customerId);
    }, [selectedConversation, allContacts]);
    
    const customerOrders = useMemo(() => {
        if (!selectedConversation) return [];
        return allOrders.filter(o => o.contact_id === selectedConversation.customerId)
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }, [selectedConversation, allOrders]);

    const currentQuote = useMemo(() => {
        if (!selectedConversation?.quoteId) return null;
        // This would fetch from 'omni_quotes' in a full implementation
        return null;
    }, [selectedConversation]);

    const handleSelectConversation = async (conversationId: string) => {
        setSelectedConversationId(conversationId);
        
        const convoToUpdate = conversations.find(c => c.id === conversationId);
        if (convoToUpdate && convoToUpdate.unreadCount > 0) {
            setConversations(prev => prev.map(c =>
                c.id === conversationId ? { ...c, unreadCount: 0 } : c
            ));
            
            await supabase
                .from('omni_conversations')
                .update({ unreadCount: 0 })
                .eq('id', conversationId);
        }
    };
    
    const sendMessage = async (content: string, type: 'text' | 'note' = 'text') => {
        if (!selectedConversationId || !content.trim()) return;

        const direction = type === 'note' ? 'note' : 'out';
        const newMessage = {
            conversationId: selectedConversationId,
            direction,
            type: 'text',
            content,
            status: 'sent',
            authorId: user.uid,
            authorName: user.role,
        };
        
        setIsSending(true);
        const { error } = await supabase.from('omni_messages').insert(newMessage);
        setIsSending(false);

        if (error) {
            console.error("Error sending message:", error);
            toast({ title: "Erro", description: "Não foi possível enviar a mensagem.", variant: 'destructive' });
        }
    };

    return {
        isLoading,
        isSending,
        filteredConversations,
        selectedConversation,
        currentMessages: messages,
        customerInfo,
        customerOrders,
        currentQuote,
        assigneeFilter,
        setAssigneeFilter,
        setSelectedConversation: handleSelectConversation,
        sendMessage,
    };
}