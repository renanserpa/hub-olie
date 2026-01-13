import React, { useState, useRef } from 'react';
import { Paperclip, Send, StickyNote, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';

interface ComposerProps {
    onSendMessage: (content: string, type: 'text' | 'note') => void;
    isSending: boolean;
}

const Composer: React.FC<ComposerProps> = ({ onSendMessage, isSending }) => {
    const [content, setContent] = useState('');
    const [isNote, setIsNote] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSend = () => {
        if (content.trim()) {
            onSendMessage(content, isNote ? 'note' : 'text');
            setContent('');
        }
    };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="p-4 border-t border-border bg-background">
            {isNote && (
                <div className="text-xs text-amber-700 bg-amber-100 p-2 rounded-md mb-2">
                    Você está digitando uma nota interna. Ela não será enviada para o cliente.
                </div>
            )}
            <div className="relative">
                <textarea
                    ref={textareaRef}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={isNote ? "Digite sua nota interna..." : "Digite sua mensagem..."}
                    className="w-full p-3 pr-24 border border-border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                    rows={2}
                    disabled={isSending}
                />
                <div className="absolute top-2 right-2 flex items-center gap-1">
                     <Button variant="ghost" size="icon" className="h-8 w-8 text-textSecondary">
                        <Paperclip size={18} />
                    </Button>
                    <Button variant="ghost" size="icon" className={cn("h-8 w-8", isNote ? 'text-primary' : 'text-textSecondary')} onClick={() => setIsNote(!isNote)}>
                        <StickyNote size={18} />
                    </Button>
                </div>
                 <Button
                    size="icon"
                    className="absolute bottom-2 right-2 h-9 w-12"
                    onClick={handleSend}
                    disabled={isSending || !content.trim()}
                 >
                    {isSending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                </Button>
            </div>
        </div>
    );
};

export default Composer;