import React, { useMemo, useState } from 'react';
import { Task, TaskStatus } from '../../types';
import KanbanColumn from './KanbanColumn';
import { Loader2 } from 'lucide-react';

interface KanbanBoardProps {
    tasks: Task[];
    statuses: TaskStatus[];
    onTaskMove: (taskId: string, newStatusId: string, newPosition: number) => void;
    isLoading: boolean;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ tasks, statuses, onTaskMove, isLoading }) => {
    const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

    const tasksByStatus = useMemo(() => {
        const grouped: { [key: string]: Task[] } = {};
        statuses.forEach(status => {
            grouped[status.id] = [];
        });
        tasks.forEach(task => {
            if (grouped[task.status_id]) {
                grouped[task.status_id].push(task);
            }
        });
        // Sort tasks within each group by position
        for (const statusId in grouped) {
            grouped[statusId].sort((a, b) => a.position - b.position);
        }
        return grouped;
    }, [tasks, statuses]);
    
    const handleDragStart = (taskId: string) => {
        setDraggedTaskId(taskId);
    };

    const handleDrop = (statusId: string) => {
        if (draggedTaskId) {
            onTaskMove(draggedTaskId, statusId, tasksByStatus[statusId]?.length || 0);
            setDraggedTaskId(null);
        }
    };


    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6">
            {statuses.map(status => (
                <KanbanColumn
                    key={status.id}
                    status={status}
                    tasks={tasksByStatus[status.id] || []}
                    onDrop={() => handleDrop(status.id)}
                    onTaskDragStart={handleDragStart}
                />
            ))}
        </div>
    );
};

export default KanbanBoard;
