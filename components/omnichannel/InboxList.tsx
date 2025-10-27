import React from 'react';
import { Conversation } from '../../types';
import { Search, Inbox as InboxIcon } from 'lucide-react';
import ConversationCard from './ConversationCard';
import { cn } from '../../lib/utils';

interface InboxListProps {
    conversations: Conversation[];
    selectedConversationId: string | null;
    onSelectConversation: (id: string) => void;
    assigneeFilter: 'all' | 'mine' | 'unassigned';
    onAssigneeFilterChange: (filter: 'all' | 'mine' | 'unassigned') => void;
}

const assigneTabs: { id: 'all' | 'mine' | 'unassigned', label: string }[] = [
    { id: 'all', label: 'Todos' },
    { id: 'mine', label: 'Meus' },
    { id: 'unassigned', label: 'Não atribuídos' }
];

const InboxList: React.FC<InboxListProps> = ({ conversations, selectedConversationId, onSelectConversation, assigneeFilter, onAssigneeFilterChange }) => {
    return (
        <div className="h-full flex flex-col bg-secondary/50">
            <div className="p-4 border-b border-border">
                <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Search className="h-4 w-4 text-textSecondary" />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar conversa..."
                        className="w-full pl-9 pr-3 py-2 border border-border rounded-xl shadow-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                </div>
                <div className="mt-3">
                     <nav className="flex space-x-2 p-1 bg-background rounded-lg" aria-label="Tabs">
                        {assigneTabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => onAssigneeFilterChange(tab.id)}
                                className={cn(
                                    'flex-1 whitespace-nowrap py-1.5 px-2 rounded-md font-medium text-xs transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
                                    assigneeFilter === tab.id
                                    ? 'bg-card text-primary shadow-sm'
                                    : 'border-transparent text-textSecondary hover:text-textPrimary hover:bg-white/60'
                                )}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {conversations.length > 0 ? (
                    <div className="p-2 space-y-1">
                        {conversations.map(conv => (
                            <ConversationCard 
                                key={conv.id} 
                                conversation={conv}
                                isSelected={conv.id === selectedConversationId}
                                onClick={() => onSelectConversation(conv.id)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-textSecondary pt-16">
                        <InboxIcon className="mx-auto h-12 w-12 text-gray-300" />
                        <h3 className="mt-4 text-md font-medium text-textPrimary">Nenhuma conversa</h3>
                        <p className="mt-1 text-sm">Nenhuma conversa encontrada para este filtro.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InboxList;