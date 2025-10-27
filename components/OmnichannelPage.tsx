import React from 'react';
import { User, Contact, Order } from '../types';
import { useOmnichannel } from '../hooks/useOmnichannel';
import InboxList from './omnichannel/InboxList';
import ConversationThread from './omnichannel/ConversationThread';
import CustomerPanel from './omnichannel/CustomerPanel';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from './ui/Resizable';
import { Inbox, MessageCircle, User as UserIcon } from 'lucide-react';

interface OmnichannelPageProps {
    user: User;
    allContacts: Contact[];
    allOrders: Order[];
}

const OmnichannelPage: React.FC<OmnichannelPageProps> = ({ user, allContacts, allOrders }) => {
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
    } = useOmnichannel(user, allContacts, allOrders);

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
            <ResizablePanelGroup direction="horizontal" className="flex-1">
                <ResizablePanel defaultSize={25} minSize={20} maxSize={35}>
                    <InboxList
                        conversations={filteredConversations}
                        selectedConversationId={selectedConversation?.id || null}
                        onSelectConversation={setSelectedConversation}
                        assigneeFilter={assigneeFilter}
                        onAssigneeFilterChange={setAssigneeFilter}
                    />
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel defaultSize={50} minSize={30}>
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
                <ResizablePanel defaultSize={25} minSize={20} maxSize={35}>
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
            </ResizablePanelGroup>
        </div>
    );
};

export default OmnichannelPage;