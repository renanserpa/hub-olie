import React from 'react';
import { Task } from '../../types';
import { GripVertical, Clock } from 'lucide-react';

interface KanbanTaskCardProps {
    task: Task;
    onDragStart: () => void;
}

const KanbanTaskCard: React.FC<KanbanTaskCardProps> = ({ task, onDragStart }) => {
    
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        e.dataTransfer.setData('taskId', task.id);
        onDragStart();
        e.currentTarget.style.opacity = '0.5';
    };
    
    const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
        e.currentTarget.style.opacity = '1';
    };

    return (
        <div 
            draggable
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            className="bg-card p-3 rounded-lg shadow-sm border border-border cursor-grab active:cursor-grabbing"
        >
            <div className="flex items-start">
                <div className="flex-1">
                    <p className="font-semibold text-sm text-textPrimary">{task.title}</p>
                    <p className="text-xs text-textSecondary mt-1">{task.client_name}</p>
                </div>
                <button className="text-textSecondary/50 hover:text-textSecondary">
                     <GripVertical size={18} />
                </button>
            </div>
            <div className="mt-3 flex items-center text-xs text-textSecondary">
                <Clock size={12} className="mr-1.5" />
                <span>Qtd: {task.quantity}</span>
            </div>
        </div>
    );
};

export default KanbanTaskCard;
