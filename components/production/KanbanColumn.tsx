import React, { useState } from 'react';
import { Task, TaskStatus } from '../../types';
import KanbanTaskCard from './KanbanTaskCard';
import { cn } from '../../lib/utils';

interface KanbanColumnProps {
    status: TaskStatus;
    tasks: Task[];
    onDrop: () => void;
    onTaskDragStart: (taskId: string) => void;
}

const colorMap: Record<string, string> = {
  orange: 'bg-orange-100/60 dark:bg-orange-900/30',
  sky: 'bg-sky-100/60 dark:bg-sky-900/30',
  purple: 'bg-purple-100/60 dark:bg-purple-900/30',
  green: 'bg-green-100/60 dark:bg-green-900/30',
};

const KanbanColumn: React.FC<KanbanColumnProps> = ({ status, tasks, onDrop, onTaskDragStart }) => {
    const [isOver, setIsOver] = useState(false);
    const columnColorClass = colorMap[status.color] || 'bg-gray-100/60 dark:bg-gray-900/30';

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsOver(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsOver(false);
    };
    
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsOver(false);
        onDrop();
    };

    return (
        <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
                "w-72 flex-shrink-0 rounded-xl transition-colors duration-200",
                isOver ? 'bg-primary/10' : columnColorClass
            )}
        >
            <div className="p-4">
                <div className="flex justify-between items-center mb-4 px-1">
                    <h3 className="font-semibold text-sm text-textPrimary dark:text-dark-textPrimary">{status.name}</h3>
                    <span className="text-xs font-medium text-textSecondary dark:text-dark-textSecondary bg-white/60 dark:bg-black/20 px-2 py-1 rounded-full">
                        {tasks.length} {tasks.length === 1 ? 'tarefa' : 'tarefas'}
                    </span>
                </div>
                <div className="space-y-3 min-h-[100px]">
                    {tasks.length > 0 ? (
                        tasks.map(task => (
                            <KanbanTaskCard 
                                key={task.id} 
                                task={task} 
                                onDragStart={() => onTaskDragStart(task.id)}
                            />
                        ))
                    ) : (
                        <div className="text-center text-sm text-textSecondary/70 dark:text-dark-textSecondary/70 pt-8">
                            Nenhuma tarefa
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default KanbanColumn;