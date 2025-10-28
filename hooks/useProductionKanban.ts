

import { useState, useEffect, useCallback } from 'react';
import { Task, TaskStatus } from '../types';
import { supabaseService } from '../services/supabaseService';
import { toast } from './use-toast';

export function useProductionKanban() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [statuses, setStatuses] = useState<TaskStatus[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadKanbanData = useCallback(async () => {
        setIsLoading(true);
        try {
            // These functions are now safe and will return [] if tables don't exist
            const [tasksData, statusesData] = await Promise.all([
                supabaseService.getTasks(),
                supabaseService.getTaskStatuses(),
            ]);
            setTasks(tasksData);
            setStatuses(statusesData.sort((a,b) => a.position - b.position));
        } catch (error) {
            toast({ title: "Erro!", description: "Não foi possível carregar os dados do Kanban.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadKanbanData();
    }, [loadKanbanData]);

    const moveTask = useCallback(async (taskId: string, newStatusId: string, newPosition: number) => {
        const originalTasks = tasks;
        const taskToMove = tasks.find(t => t.id === taskId);
        
        if (!taskToMove) return;

        // Optimistic update
        const updatedTasks = tasks.map(t => 
            t.id === taskId 
                ? { ...t, status_id: newStatusId, position: newPosition } 
                : t
        );
        
        updatedTasks
            .filter(t => t.status_id === newStatusId && t.id !== taskId)
            .sort((a, b) => a.position - b.position)
            .forEach((t, index) => {
                t.position = index >= newPosition ? index + 1 : index;
            });
            
        setTasks(updatedTasks.sort((a, b) => a.position - b.position));
        
        try {
            // This will console.warn but not throw, which is fine for optimistic UI
            await supabaseService.updateDocument('tasks', taskId, { status_id: newStatusId, position: newPosition });
        } catch (error) {
            setTasks(originalTasks);
            toast({ title: "Erro!", description: "Não foi possível mover a tarefa.", variant: "destructive" });
        }
    }, [tasks]);

    return {
        tasks,
        statuses,
        isLoading,
        moveTask,
    };
}
