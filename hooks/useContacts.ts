import { useState, useEffect, useMemo, useCallback } from 'react';
import { Contact, AnyContact } from '../types';
import { dataService } from '../services/dataService';
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
            const contacts = await dataService.getContacts();
            setAllContacts(contacts);
        } catch (error) {
             toast({ title: "Erro!", description: "Não foi possível carregar os contatos.", variant: "destructive" });
        } finally {
            setIsDataLoading(false);
        }
    }, []);

    useEffect(() => {
        loadContacts();
        const listener = dataService.listenToCollection<Contact>('customers', undefined, (newContacts) => {
            setAllContacts(newContacts);
        });
        return () => listener.unsubscribe();
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
                // FIX: Added explicit generic type <Contact> to updateDocument call to ensure type safety.
                await dataService.updateDocument<Contact>('customers', id, dataToUpdate);
                toast({ title: "Sucesso!", description: "Contato atualizado." });
            } else {
                // FIX: Added explicit generic type <Contact> to addDocument call to ensure type safety.
                await dataService.addDocument<Contact>('customers', contactData as AnyContact);
                toast({ title: "Sucesso!", description: "Novo contato criado." });
            }
            // No need to call loadContacts() here, the listener will update the state.
            closeDialog();
        } catch (error) {
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