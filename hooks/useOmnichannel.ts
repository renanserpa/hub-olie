

import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabaseService } from '../services/firestoreService';
import { toast } from './use-toast';
import { Conversation, Message, Quote, Contact, Order, User } from '../types';

// NOTE: Real-time functionality is disabled pending Supabase migration.
// All Firebase-related imports and listeners have been removed.

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

    useEffect(() => {
        const fetchAllData = async () => {
            setIsLoading(true);
            try {
                 const [contactsData, ordersData] = await Promise.all([
                    supabaseService.getCollection<Contact>('contacts'),
                    supabaseService.getOrders()
                 ]);
                 setAllContacts(contactsData);
                 setAllOrders(ordersData);
                 // Mock data load for now
                 setConversations([]);
                 setMessages([]);
            } catch(e) {
                 toast({ title: 'Erro!', description: 'Não foi possível carregar dados de apoio do omnichannel.', variant: 'destructive' });
            } finally {
                setIsLoading(false);
            }
        };
        fetchAllData();
    }, []);


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
        // FIX: Property 'contact_id' does not exist on type 'Order'. Use 'customer_id' instead.
        return allOrders.filter(o => o.customer_id === selectedConversation.customerId)
            .sort((a, b) => safeGetTime(b.created_at) - safeGetTime(a.created_at));
    }, [selectedConversation, allOrders]);

    const currentQuote = useMemo(() => {
        if (!selectedConversation?.quoteId) return null;
        // This would fetch from 'omni_quotes' in a full implementation
        return null;
    }, [selectedConversation]);

    const handleSelectConversation = async (conversationId: string) => {
        setSelectedConversationId(conversationId);
        // Real-time update logic will be added by SupaDataMaster
    };
    
    const sendMessage = async (content: string, type: 'text' | 'note' = 'text') => {
        if (!selectedConversationId || !content.trim()) return;

        console.warn('sendMessage not implemented for Supabase yet.');
        toast({ title: "Funcionalidade desabilitada", description: "O envio de mensagens será reativado após a migração para Supabase.", variant: "destructive"});
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