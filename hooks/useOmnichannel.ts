import { useState, useEffect, useMemo, useCallback } from 'react';
import { firebaseService } from '../services/firestoreService';
import { toast } from './use-toast';
import { Conversation, Message, Quote, Contact, Order, User } from '../types';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';


export function useOmnichannel(user: User, allContacts: Contact[], allOrders: Order[]) {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
    const [assigneeFilter, setAssigneeFilter] = useState<'all' | 'mine' | 'unassigned'>('all');

    // Real-time listener for conversations
    useEffect(() => {
        setIsLoading(true);
        const q = query(collection(db, 'omni_conversations'), orderBy('lastMessageAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const convosData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Conversation);
            setConversations(convosData);

            if (isLoading) { // On first load, select the first conversation
                const firstConversation = convosData?.[0];
                if (firstConversation && !selectedConversationId) {
                    setSelectedConversationId(firstConversation.id);
                }
            }
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching conversations in real-time:", error);
            toast({ title: 'Erro de Conexão!', description: 'Não foi possível carregar as conversas em tempo real.', variant: 'destructive' });
            setIsLoading(false);
        });

        return () => unsubscribe(); // Cleanup listener on unmount
    }, []); // Empty dependency array to set up the listener only once

    // Real-time listener for messages of the selected conversation
    useEffect(() => {
        if (!selectedConversationId) {
            setMessages([]);
            return;
        }

        const q = query(collection(db, `omni_conversations/${selectedConversationId}/messages`), orderBy('createdAt', 'asc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const messagesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Message);
            setMessages(messagesData);
        }, (error) => {
            console.error(`Error fetching messages for convo ${selectedConversationId}:`, error);
            toast({ title: 'Erro!', description: 'Não foi possível carregar as mensagens.', variant: 'destructive' });
        });

        return () => unsubscribe(); // Cleanup listener
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
            // Optimistic update for faster UI response
            setConversations(prev => prev.map(c =>
                c.id === conversationId ? { ...c, unreadCount: 0 } : c
            ));
            await firebaseService.updateDocument('omni_conversations', conversationId, { unreadCount: 0 });
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
            createdAt: serverTimestamp(),
        };
        
        setIsSending(true);
        try {
            await firebaseService.addDocument(`omni_conversations/${selectedConversationId}/messages`, newMessage);
            await firebaseService.updateDocument('omni_conversations', selectedConversationId, {
                lastMessageAt: serverTimestamp(),
                title: content, // Update the preview text of the conversation
            });
        } catch(error) {
            console.error("Error sending message:", error);
            toast({ title: "Erro", description: "Não foi possível enviar a mensagem.", variant: 'destructive' });
        } finally {
            setIsSending(false);
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