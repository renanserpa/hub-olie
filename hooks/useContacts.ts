import { useState, useEffect, useMemo, useCallback } from 'react';
import { Contact, AnyContact } from '../types';
import { dataService } from '../services/dataService';
import { toast } from './use-toast';

export function useContacts() {
    const [allContacts, setAllContacts] = useState<Contact[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<'all' | 'birthdays'>('all');
    
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingContact, setEditingContact] = useState<Contact | null>(null);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await dataService.getContacts();
            setAllContacts(data);
        } catch (error) {
            toast({ title: "Erro!", description: "Não foi possível carregar os contatos.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
        const listener = dataService.listenToCollection<Contact>('customers', undefined, (newContacts) => {
            setAllContacts(newContacts);
        });
        return () => listener.unsubscribe();
    }, [loadData]);


    const filteredContacts = useMemo(() => {
        let contacts = allContacts;

        if (searchQuery) {
            const lowercasedQuery = searchQuery.toLowerCase();
            contacts = contacts.filter(c =>
                c.name.toLowerCase().includes(lowercasedQuery) ||
                (c.email && c.email.toLowerCase().includes(lowercasedQuery)) ||
                (c.phone && c.phone.includes(lowercasedQuery)) ||
                (c.document && c.document.includes(lowercasedQuery))
            );
        }
        
        if (filter === 'birthdays') {
            const currentMonth = new Date().getMonth();
            contacts = contacts.filter(c => {
                if (!c.birth_date) return false;
                // Handles date strings like 'YYYY-MM-DD' correctly by adding a time to avoid timezone issues.
                const birthDate = new Date(`${c.birth_date}T00:00:00`);
                return birthDate.getMonth() === currentMonth;
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
        setIsSaving(true);
        try {
            if ('id' in contactData && contactData.id) {
                await dataService.updateDocument('customers', contactData.id, contactData);
                toast({ title: "Sucesso!", description: "Contato atualizado." });
            } else {
                await dataService.addDocument('customers', contactData as AnyContact);
                toast({ title: "Sucesso!", description: "Novo contato criado." });
            }
            closeDialog();
        } catch (error) {
            toast({ title: "Erro!", description: "Não foi possível salvar o contato.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    return {
        isLoading,
        isSaving,
        allContacts,
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