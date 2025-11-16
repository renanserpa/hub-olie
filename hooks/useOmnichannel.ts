import { useState, useEffect, useMemo, useCallback } from 'react';
import { dataService } from '../services/dataService';
import { toast } from './use-toast';
import { Conversation, Message, Quote as _Quote, Contact, Order, User } from '../types';

const safeGetTime = (dateValue: any): number => {
    if (!dateValue) return 0;
    const date = dateValue.toDate ? dateValue.toDate() : new Date(dateValue);
    if (isNaN(date.getTime())) return 0;
    return date.getTime();
};

export function useOmnichannel(user: User) {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [allContacts, setAllContacts] = useState<Contact[]>([]);
    const [allOrders, setAllOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
    const [assigneeFilter, setAssigneeFilter] = useState<'all' | 'mine' | 'unassigned'>('all');

    const loadAuxData = useCallback(async () => {
        try {
            const [contactsData, ordersData] = await Promise.all([
                dataService.getContacts(),
                dataService.getOrders(),
            ]);
            setAllContacts(contactsData);
            setAllOrders(ordersData);
        } catch(e) {
            toast({ title: 'Erro!', description: 'Não foi possível carregar dados de apoio do omnichannel.', variant: 'destructive' });
        }
    }, []);

    useEffect(() => {
        setIsLoading(true);
        loadAuxData();

        // FIX: Added the 4th argument `setConversations` to match the expected signature of `listenToCollection`.
        const convListener = dataService.listenToCollection<Conversation>('conversations', undefined, (data) => {
            setConversations(data.sort((a, b) => safeGetTime(b.lastMessageAt) - safeGetTime(a.lastMessageAt)));
            setIsLoading(false);
        }, setConversations);

        // FIX: Added the 4th argument `setMessages` to match the expected signature of `listenToCollection`.
        const msgListener = dataService.listenToCollection<Message>('messages', undefined, (data) => {
            setMessages(data);
        }, setMessages);
        
        return () => {
            convListener.unsubscribe();
            msgListener.unsubscribe();
        };

    }, [loadAuxData]);


    const filteredConversations = useMemo(() => {
        let convos = [...conversations];
        // FIX: Changed user.uid to user.id to align with updated User type.
        if (assigneeFilter === 'mine') return convos.filter(c => c.assigneeId === user.id);
        if (assigneeFilter === 'unassigned') return convos.filter(c => !c.assigneeId);
        return convos;
    }, [conversations, assigneeFilter, user.id]);

    const selectedConversation = useMemo(() => {
        return conversations.find(c => c.id === selectedConversationId) || null;
    }, [conversations, selectedConversationId]);

    const currentMessages = useMemo(() => {
        if (!selectedConversationId) return [];
        return messages
            .filter(m => m.conversationId === selectedConversationId)
            .sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }, [messages, selectedConversationId]);

    const customerInfo = useMemo(() => {
        if (!selectedConversation) return null;
        return allContacts.find(c => c.id === selectedConversation.customerId);
    }, [selectedConversation, allContacts]);
    
    const customerOrders = useMemo(() => {
        if (!selectedConversation) return [];
        return allOrders.filter(o => o.customer_id === selectedConversation.customerId)
            .sort((a, b) => safeGetTime(b.created_at) - safeGetTime(a.created_at));
    }, [selectedConversation, allOrders]);

    const _currentQuote = useMemo(() => {
        if (!selectedConversation?.quoteId) return null;
        return null;
    }, [selectedConversation]);

    const handleSelectConversation = async (conversationId: string) => {
        setSelectedConversationId(conversationId);
    };
    
    const sendMessage = async (content: string, type: 'text' | 'note' = 'text') => {
        if (!selectedConversationId || !content.trim()) return;
        console.warn('sendMessage not implemented yet.');
        toast({ title: "Funcionalidade desabilitada", description: "O envio de mensagens será implementado em breve.", variant: "destructive"});
    };

    return {
        isLoading,
        isSending,
        filteredConversations,
        selectedConversation,
        currentMessages,
        customerInfo,
        customerOrders,
        assigneeFilter,
        setAssigneeFilter,
        setSelectedConversation: handleSelectConversation,
        sendMessage,
    };
}