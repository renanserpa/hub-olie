

import React from 'react';
import { User, Contact, Order } from '../types';
import { useOmnichannel } from '../hooks/useOmnichannel';
import InboxList from './omnichannel/InboxList';
import ConversationThread from './omnichannel/ConversationThread';
import CustomerPanel from './omnichannel/CustomerPanel';
import { Resizable, ResizablePanel, ResizableHandle } from './ui/Resizable';
import { MessageCircle, User as UserIcon } from 'lucide-react';

interface OmnichannelPageProps {
    user: User;
}

const OmnichannelPage: React.FC<OmnichannelPageProps> = ({ user }) => {
    const {
        isLoading,
        isSending,
        filteredConversations,
        selectedConversation,
        currentMessages,
        customerInfo,
        customerOrders,
        currentQuote,
        assigneeFilter,
        setAssigneeFilter,
        setSelectedConversation,
        sendMessage,
    } = useOmnichannel(user);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-200px)]">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-primary"></div>
                    <p className="mt-4 text-lg font-semibold text-textSecondary">Carregando conversas...</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="h-[calc(100vh-10rem)] border border-border rounded-2xl bg-card overflow-hidden flex flex-col">
            {/* FIX: Correctly wrap ResizablePanel and ResizableHandle components inside Resizable to satisfy the 'children' prop requirement. */}
            <Resizable direction="horizontal" initialSizes={[24, 52, 24]} minSizes={[20, 30, 20]} className="flex-1">
                {/* FIX: Wrap InboxList within ResizablePanel to provide the required 'children' prop. */}
                <ResizablePanel>
                    <InboxList
                        conversations={filteredConversations}
                        selectedConversationId={selectedConversation?.id || null}
                        onSelectConversation={setSelectedConversation}
                        assigneeFilter={assigneeFilter}
                        onAssigneeFilterChange={setAssigneeFilter}
                    />
                </ResizablePanel>
                <ResizableHandle />
                {/* FIX: Wrap ConversationThread/placeholder within ResizablePanel to provide the required 'children' prop. */}
                <ResizablePanel>
                    {selectedConversation ? (
                        <ConversationThread
                            key={selectedConversation.id}
                            conversation={selectedConversation}
                            messages={currentMessages}
                            onSendMessage={sendMessage}
                            isSending={isSending}
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center text-textSecondary p-4">
                            <MessageCircle size={48} className="mb-4 text-gray-300" />
                            <h2 className="text-xl font-semibold text-textPrimary">Selecione uma conversa</h2>
                            <p>Escolha uma conversa da lista para ver as mensagens.</p>
                        </div>
                    )}
                </ResizablePanel>
                <ResizableHandle />
                {/* FIX: Wrap CustomerPanel/placeholder within ResizablePanel to provide the required 'children' prop. */}
                <ResizablePanel>
                     {selectedConversation ? (
                        <CustomerPanel
                            key={selectedConversation.id}
                            customer={customerInfo}
                            orders={customerOrders}
                            quote={currentQuote}
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center text-textSecondary p-4">
                            <UserIcon size={48} className="mb-4 text-gray-300" />
                            <h2 className="text-xl font-semibold text-textPrimary">Informações do Cliente</h2>
                            <p>Os detalhes do cliente aparecerão aqui.</p>
                        </div>
                    )}
                </ResizablePanel>
            </Resizable>
        </div>
    );
};

export default OmnichannelPage;