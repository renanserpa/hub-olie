import React, { useState } from 'react';
import type { User } from '../types';
import { Users, Plus, Search, Loader2, LayoutGrid, List, Columns } from 'lucide-react';
import { Button } from './ui/Button';
import { useContacts } from '../hooks/useContacts';
import ContactCard from './contacts/ContactCard';
import ContactDialog from './contacts/ContactDialog';
import { cn } from '../lib/utils';
import ContactsKanban from './contacts/ContactsKanban';
import ContactsTable from './contacts/ContactsTable';

const ContactsPage: React.FC = () => {
    const [viewMode, setViewMode] = useState<'list' | 'kanban' | 'table'>('list');
    
    const {
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
        updateContactStage
    } = useContacts();
    
    const TABS = [
        { id: 'all', label: `Todos (${allContacts.length})` },
        { id: 'birthdays', label: 'Aniversariantes do Mês' },
    ];

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="text-center py-10 flex items-center justify-center gap-2 text-textSecondary">
                    <Loader2 className="h-5 w-5 animate-spin"/> Carregando contatos...
                </div>
            );
        }

        if (filteredContacts.length === 0) {
            return (
                <div className="text-center text-textSecondary py-16 border-2 border-dashed border-border rounded-xl">
                    <Users className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium text-textPrimary">Nenhum contato encontrado</h3>
                    <p className="mt-1 text-sm">Nenhum contato corresponde aos filtros selecionados.</p>
                </div>
            );
        }

        switch(viewMode) {
            case 'kanban':
                return <ContactsKanban 
                    contacts={filteredContacts}
                    onStageChange={updateContactStage}
                    onCardClick={(contact) => openDialog(contact)}
                />;
            case 'table':
                 return <ContactsTable contacts={filteredContacts} onEdit={(contact) => openDialog(contact)} />;
            case 'list':
            default:
                return (
                    <div className="space-y-4">
                        {filteredContacts.map(contact => (
                            <ContactCard key={contact.id} contact={contact} onEdit={() => openDialog(contact)} />
                        ))}
                    </div>
                );
        }
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-end sm:items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                    <div className="flex items-center p-1 rounded-lg bg-secondary">
                       <Button 
                         variant={viewMode === 'list' ? 'primary' : 'ghost'} 
                         size="sm" 
                         onClick={() => setViewMode('list')} 
                         className="h-8 w-8 p-0"
                         aria-label="Visualização em Lista"
                       >
                           <List size={16} />
                       </Button>
                        <Button 
                          variant={viewMode === 'kanban' ? 'primary' : 'ghost'} 
                          size="sm" 
                          onClick={() => setViewMode('kanban')} 
                          className="h-8 w-8 p-0"
                           aria-label="Visualização em Kanban"
                        >
                            <LayoutGrid size={16} />
                        </Button>
                         <Button 
                          variant={viewMode === 'table' ? 'primary' : 'ghost'} 
                          size="sm" 
                          onClick={() => setViewMode('table')} 
                          className="h-8 w-8 p-0"
                           aria-label="Visualização em Tabela"
                        >
                            <Columns size={16} />
                        </Button>
                    </div>
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

            {renderContent()}
            
            <ContactDialog
                isOpen={isDialogOpen}
                onClose={closeDialog}
                onSave={saveContact}
                contact={editingContact}
                isSaving={isSaving}
            />

        </div>
    );
};

export default ContactsPage;