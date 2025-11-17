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
