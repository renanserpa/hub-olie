import React from 'react';
import { Task } from '../../types';
import { GripVertical, Clock, Flame } from 'lucide-react';
import { cn } from '../../lib/utils';

interface KanbanTaskCardProps {
    task: Task;
    onDragStart: () => void;
}

const PRIORITY_ICONS: Record<string, React.ReactNode> = {
    alta: <span title="Prioridade Alta"><Flame size={14} className="text-orange-500" /></span>,
    urgente: <span title="Prioridade Urgente"><Flame size={14} className="text-red-600" /></span>,
};

const KanbanTaskCard: React.FC<KanbanTaskCardProps> = ({ task, onDragStart }) => {
    
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        e.dataTransfer.setData('taskId', task.id);
        onDragStart();
        e.currentTarget.style.opacity = '0.5';
    };
    
    const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
        e.currentTarget.style.opacity = '1';
    };

    const isUrgentInProgress = task.priority === 'urgente' && task.status_id === 'ts2';

    return (
        <div 
            draggable
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            className={cn(
                "bg-card dark:bg-dark-background p-3 rounded-lg shadow-sm border border-border dark:border-dark-border cursor-grab active:cursor-grabbing",
                isUrgentInProgress && "border-red-500 ring-2 ring-red-200"
            )}
        >
            <div className="flex items-start">
                <div className="flex-1">
                    <p className="font-semibold text-sm text-textPrimary dark:text-dark-textPrimary">{task.title}</p>
                    <p className="text-xs text-textSecondary dark:text-dark-textSecondary mt-1">{task.client_name}</p>
                </div>
                <div className="flex items-center gap-1">
                    {task.priority && PRIORITY_ICONS[task.priority]}
                    <button className="text-textSecondary/50 dark:text-dark-textSecondary/50 hover:text-textSecondary dark:hover:text-dark-textSecondary">
                        <GripVertical size={18} />
                    </button>
                </div>
            </div>
            <div className="mt-3 flex items-center text-xs text-textSecondary dark:text-dark-textSecondary">
                <Clock size={12} className="mr-1.5" />
                <span>Qtd: {task.quantity}</span>
            </div>
        </div>
    );
};

export default KanbanTaskCard;