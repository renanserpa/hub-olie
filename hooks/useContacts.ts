import { useState, useEffect, useMemo, useCallback } from 'react';
import { Contact, AnyContact } from '../types';
import { firestoreService } from '../services/firestoreService';
import { toast } from './use-toast';

export function useContacts(onDataChange: () => void) {
    const [allContacts, setAllContacts] = useState<Contact[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<'all' | 'birthdays'>('all');
    
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingContact, setEditingContact] = useState<Contact | null>(null);

    const loadContacts = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await firestoreService.getContacts();
            setAllContacts(data);
        } catch (error) {
            toast({ title: "Erro!", description: "Não foi possível carregar os contatos.", variant: "destructive" });
        } finally {
            setIsLoading(false);
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
                c.email.toLowerCase().includes(lowercasedQuery) ||
                c.phone.includes(lowercasedQuery)
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
        try {
            if ('id' in contactData) {
                await firestoreService.updateContact(contactData.id, contactData);
                toast({ title: "Sucesso!", description: "Contato atualizado." });
            } else {
                await firestoreService.addContact(contactData);
                toast({ title: "Sucesso!", description: "Novo contato criado." });
            }
            onDataChange();
            loadContacts(); // Re-fetch contacts after change
            closeDialog();
        } catch (error) {
            toast({ title: "Erro!", description: "Não foi possível salvar o contato.", variant: "destructive" });
        }
    };

    return {
        isLoading,
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
