import React from 'react';
import { User } from '../types';
import { Users, Plus, Search } from 'lucide-react';
import { Button } from './ui/Button';
import { useContacts } from '../hooks/useContacts';
import ContactCard from './contacts/ContactCard';
import ContactDialog from './contacts/ContactDialog';
import { cn } from '../lib/utils';

interface ContactsPageProps {
  user: User;
  onDataChange: () => void;
}

const ContactsPage: React.FC<ContactsPageProps> = ({ user, onDataChange }) => {
    const {
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
    } = useContacts(onDataChange);
    
    const TABS = [
        { id: 'all', label: `Todos (${filteredContacts.length})` },
        { id: 'birthdays', label: 'Aniversariantes do Mês' },
    ];

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                 <div>
                    <h1 className="text-3xl font-bold text-textPrimary">Contatos</h1>
                    <p className="text-textSecondary mt-1">Gerencie seus clientes e fornecedores.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={() => openDialog()}><Plus className="w-4 h-4 mr-2" />Novo Contato</Button>
                </div>
            </div>
            
            <div className="mb-6 space-y-4">
                <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Search className="h-4 w-4 text-textSecondary" />
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar por nome, email ou telefone..."
                        className="w-full pl-9 pr-3 py-2 border border-border rounded-xl shadow-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                </div>
                 <div className="border-b border-border">
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                        {TABS.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setFilter(tab.id as 'all' | 'birthdays')}
                                className={cn(
                                    'whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-sm focus:outline-none',
                                    filter === tab.id ? 'border-primary text-primary' : 'border-transparent text-textSecondary hover:text-textPrimary'
                                )}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {isLoading ? (
                <div className="text-center py-10">Carregando contatos...</div>
            ) : (
                <div className="space-y-4">
                    {filteredContacts.map(contact => (
                        <ContactCard key={contact.id} contact={contact} onEdit={() => openDialog(contact)} />
                    ))}
                </div>
            )}
            
            <ContactDialog
                isOpen={isDialogOpen}
                onClose={closeDialog}
                onSave={saveContact}
                contact={editingContact}
            />

        </div>
    );
};

export default ContactsPage;
