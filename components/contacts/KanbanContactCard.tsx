import React from 'react';
import { Contact } from '../../types';
import { Card } from '../ui/Card';
import { cn } from '../../lib/utils';
import { Badge } from '../ui/Badge';
import { GripVertical } from 'lucide-react';

interface KanbanContactCardProps {
    contact: Contact;
    onEdit: () => void;
}

const KanbanContactCard: React.FC<KanbanContactCardProps> = ({ contact, onEdit }) => {
    
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        e.dataTransfer.setData('contactId', contact.id);
        e.currentTarget.style.opacity = '0.5';
        e.currentTarget.classList.add('shadow-lg', 'rotate-3');
    };
    
    const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
        e.currentTarget.style.opacity = '1';
        e.currentTarget.classList.remove('shadow-lg', 'rotate-3');
    };

    return (
        <div 
            draggable
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onClick={onEdit}
            className="p-3 rounded-lg shadow-sm border bg-card border-border cursor-grab active:cursor-grabbing hover:shadow-md hover:border-primary/50 transition-all duration-200"
        >
            <div className="flex items-start">
                <div className="w-8 h-8 rounded-full bg-accent text-primary flex items-center justify-center font-bold text-xs flex-shrink-0 mr-3 mt-1">
                    {contact.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-textPrimary truncate">{contact.name}</p>
                    <p className="text-xs text-textSecondary truncate">{contact.email || contact.phone}</p>
                </div>
                <button className="text-textSecondary/50 hover:text-textSecondary">
                    <GripVertical size={18} />
                </button>
            </div>
            {contact.tags && contact.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                    {contact.tags.slice(0, 2).map(tag => (
                        <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>
                    ))}
                </div>
            )}
        </div>
    );
};

export default KanbanContactCard;
