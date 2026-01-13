import React, { useState } from 'react';
import { Contact, ContactStage } from '../../types';
import KanbanContactCard from './KanbanContactCard';
import { cn } from '../../lib/utils';

const CONTACT_COLUMNS: { id: ContactStage, label: string }[] = [
  { id: 'Lead', label: 'Leads' },
  { id: 'Cliente Ativo', label: 'Clientes Ativos' },
  { id: 'Contato Geral', label: 'Contatos Gerais' },
  { id: 'Fornecedor', label: 'Fornecedores' },
  { id: 'Inativo', label: 'Inativos' },
];

interface ContactsKanbanProps {
  contacts: Contact[];
  onStageChange: (contactId: string, newStage: ContactStage) => void;
  onCardClick: (contact: Contact) => void;
}

const ContactsKanban: React.FC<ContactsKanbanProps> = ({ contacts, onStageChange, onCardClick }) => {
    const [isDraggingOver, setIsDraggingOver] = useState<ContactStage | null>(null);

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>, stage: ContactStage) => {
        e.preventDefault();
        setIsDraggingOver(stage);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDraggingOver(null);
    }
    
    const handleDrop = (e: React.DragEvent<HTMLDivElement>, newStage: ContactStage) => {
        e.preventDefault();
        setIsDraggingOver(null);
        const contactId = e.dataTransfer.getData('contactId');
        if (contactId) {
            const contact = contacts.find(c => c.id === contactId);
            if (contact && (contact.stage || 'Contato Geral') !== newStage) {
                onStageChange(contactId, newStage);
            }
        }
    };

    return (
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 sm:-mx-6 px-4 sm:px-6">
            {CONTACT_COLUMNS.map(column => (
                <div 
                    key={column.id}
                    onDragOver={(e) => handleDragOver(e, column.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, column.id)}
                    className={cn(
                        "w-72 md:w-80 flex-shrink-0 bg-secondary dark:bg-dark-secondary p-3 rounded-xl transition-colors duration-200",
                        isDraggingOver === column.id && "bg-primary/10"
                    )}
                >
                    <div className="flex justify-between items-center mb-4 px-1">
                        <h3 className="font-semibold text-sm text-textPrimary dark:text-dark-textPrimary">{column.label}</h3>
                        <span className="text-xs font-medium text-textSecondary dark:text-dark-textSecondary bg-background dark:bg-dark-background px-2 py-1 rounded-full">
                            {contacts.filter(c => (c.stage || 'Contato Geral') === column.id).length}
                        </span>
                    </div>
                    <div className="space-y-3 min-h-[200px]">
                        {contacts
                            .filter(contact => (contact.stage || 'Contato Geral') === column.id)
                            .map(contact => (
                                <KanbanContactCard 
                                    key={contact.id} 
                                    contact={contact} 
                                    onEdit={() => onCardClick(contact)}
                                />
                            ))
                        }
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ContactsKanban;
