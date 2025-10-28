

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Contact, AnyContact } from '../types';
import { supabaseService } from '../services/firestoreService';
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
            const contacts = await supabaseService.getCollection<Contact>('customers');
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
                (c.phones?.main && c.phones.main.includes(lowercasedQuery))
            );
        }

        // Birthday filter logic needs to be adapted since birth_date is not in the schema
        // if (filter === 'birthdays') { ... }
        
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
            if ('id' in contactData && contactData.id) {
                const { id, ...dataToUpdate } = contactData;
                await supabaseService.updateDocument('customers', id, dataToUpdate);
                toast({ title: "Sucesso!", description: "Contato atualizado." });
            } else {
                await supabaseService.addDocument('customers', contactData);
                toast({ title: "Sucesso!", description: "Novo contato criado." });
            }
            loadContacts();
            closeDialog();
        } catch (error) {
            toast({ title: "Erro!", description: "Não foi possível salvar o contato.", variant: "destructive" });
        } finally {
            setIsMutationLoading(false);
        }
    };

    // FIX: Added the missing return statement. This hook was previously returning void.
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
