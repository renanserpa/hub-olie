import { useState, useEffect, useMemo, useCallback } from 'react';
import { Contact, AnyContact } from '../types';
import { firebaseService } from '../services/firestoreService';
import { toast } from './use-toast';

export function useContacts() {
    const [allContacts, setAllContacts] = useState<Contact[]>([]);
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [isMutationLoading, setIsMutationLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<'all' | 'birthdays'>('all');
    
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingContact, setEditingContact] = useState<Contact | null>(null);

    const loadContacts = useCallback(async () => {
        setIsDataLoading(true);
        try {
            const contacts = await firebaseService.getCollection<Contact>('contacts');
            setAllContacts(contacts);
        } catch (error) {
             toast({ title: "Erro!", description: "Não foi possível carregar os contatos.", variant: "destructive" });
        } finally {
            setIsDataLoading(false);
        }
    }, []);

    useEffect(() => {
        loadContacts();
    }, [loadContacts]);

    const filteredContacts = useMemo(() => {
        let contacts = allContacts;

        if (searchQuery) {
            const lowercasedQuery = searchQuery.toLowerCase();
            contacts = contacts.filter(c =>
                c.name.toLowerCase().includes(lowercasedQuery) ||
                (c.email && c.email.toLowerCase().includes(lowercasedQuery)) ||
                (c.phone && c.phone.includes(lowercasedQuery))
            );
        }

        if (filter === 'birthdays') {
            const currentMonth = new Date().getMonth();
            contacts = contacts.filter(c => {
                if (!c.birth_date) return false;
                // Date is YYYY-MM-DD, so month is at index 5, length 2. JS month is 0-indexed.
                const birthMonth = parseInt(c.birth_date.substring(5, 7), 10) - 1;
                return birthMonth === currentMonth;
            });
        }
        
        return contacts;
    }, [allContacts, searchQuery, filter]);
    
    const openDialog = (contact: Contact | null = null) => {
        setEditingContact(contact);
        setIsDialogOpen(true);
    };

    const closeDialog = () => {
        setEditingContact(null);
        setIsDialogOpen(false);
    };
    
    const saveContact = async (contactData: AnyContact | Contact) => {
        setIsMutationLoading(true);
        try {
            if ('id' in contactData) {
                const { id, ...dataToUpdate } = contactData;
                await firebaseService.updateDocument('contacts', id, dataToUpdate);
                toast({ title: "Sucesso!", description: "Contato atualizado." });
            } else {
                await firebaseService.addDocument('contacts', contactData);
                toast({ title: "Sucesso!", description: "Novo contato criado." });
            }
            loadContacts();
            closeDialog();
        } catch (error) {
            console.error(error);
            toast({ title: "Erro!", description: "Não foi possível salvar o contato.", variant: "destructive" });
        } finally {
            setIsMutationLoading(false);
        }
    };

    return {
        isLoading: isDataLoading,
        isSaving: isMutationLoading,
        filteredContacts,
        searchQuery,
        setSearchQuery,
        filter,
        setFilter,
        isDialogOpen,
        editingContact,
        openDialog,
        closeDialog,
        saveContact,
    };
}