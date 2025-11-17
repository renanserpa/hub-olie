import { useState, useEffect, useMemo, useCallback } from 'react';
import { dataService } from '../services/dataService';
import { toast } from './use-toast';
import { Conversation, Message, Quote as _Quote, Contact, Order, User } from '../types';

const safeGetTime = (dateValue: any): number => {
    if (!dateValue) return 0;
    // FIX: Removed the '.toDate' check, which is a legacy pattern from Firebase. Supabase returns ISO strings, which the 'new Date()' constructor handles directly.
    const date = new Date(dateValue);
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
        } catch (error) {
            toast({ title: "Erro", description: "Não foi possível carregar dados auxiliares.", variant: "destructive" });
        }
    }, []);

    useEffect(() => {
        setIsLoading(true);
        loadAuxData(); // Load contacts and orders

        const convListener = dataService.listenToCollection('conversations', undefined, setConversations, () => {
             setIsLoading(false);
        });
        const msgListener = dataService.listenToCollection('messages', undefined, setMessages);

        return () => {
            convListener.unsubscribe();
            msgListener.unsubscribe();
        };
    }, [loadAuxData]);

    const filteredConversations = useMemo(() => {
        let sorted = [...conversations].sort((a, b) => safeGetTime(b.lastMessageAt) - safeGetTime(a.lastMessageAt));
        if (assigneeFilter === 'mine') {
            return sorted.filter(c => c.assigneeId === user.id);
        }
        if (assigneeFilter === 'unassigned') {
            return sorted.filter(c => !c.assigneeId);
        }
        return sorted;
    }, [conversations, assigneeFilter, user.id]);

    const selectedConversation = useMemo(() => {
        return conversations.find(c => c.id === selectedConversationId) || null;
    }, [conversations, selectedConversationId]);

    const currentMessages = useMemo(() => {
        if (!selectedConversationId) return [];
        return messages
            .filter(m => m.conversationId === selectedConversationId)
            .sort((a, b) => safeGetTime(a.createdAt) - safeGetTime(b.createdAt));
    }, [messages, selectedConversationId]);

    const customerInfo = useMemo(() => {
        if (!selectedConversation) return null;
        return allContacts.find(c => c.id === selectedConversation.customerId);
    }, [selectedConversation, allContacts]);

    const customerOrders = useMemo(() => {
        if (!customerInfo) return [];
        return allOrders.filter(o => o.customer_id === customerInfo.id);
    }, [customerInfo, allOrders]);

    const sendMessage = useCallback(async (content: string, type: 'text' | 'note') => {
        if (!selectedConversationId) return;

        setIsSending(true);
        try {
            const newMessage: Omit<Message, 'id'> = {
                conversationId: selectedConversationId,
                direction: type === 'note' ? 'note' : 'out',
                content,
                authorName: type === 'note' ? user.email : 'Ateliê Olie',
                createdAt: new Date().toISOString(),
                status: 'sent',
            };
            await dataService.addDocument('messages', newMessage);
            // Also update the conversation's last message time
            // FIX: Add explicit generic type <Conversation> to resolve type error.
            await dataService.updateDocument<Conversation>('conversations', selectedConversationId, { lastMessageAt: new Date().toISOString() });

        } catch (error) {
            toast({ title: "Erro", description: "Não foi possível enviar a mensagem.", variant: "destructive" });
        } finally {
            setIsSending(false);
        }
    }, [selectedConversationId, user.email]);

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
        setSelectedConversation: setSelectedConversationId,
        sendMessage,
    };
}