

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
            const [tasksData, statusesData] = await Promise.all([
                supabaseService.getTasks(),
                supabaseService.getTaskStatuses(),
            ]);
            setTasks(tasksData);
            setStatuses(statusesData);
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
        // Optimistic update
        const originalTasks = tasks;
        const taskToMove = tasks.find(t => t.id === taskId);
        
        if (!taskToMove) return;

        // Update the status and position of the moved task
        const updatedTasks = tasks.map(t => 
            t.id === taskId 
                ? { ...t, status_id: newStatusId, position: newPosition } 
                : t
        );
        
        // Re-order tasks in the new column
        updatedTasks
            .filter(t => t.status_id === newStatusId && t.id !== taskId)
            .sort((a, b) => a.position - b.position)
            .forEach((t, index) => {
                t.position = index >= newPosition ? index + 1 : index;
            });
            
        setTasks(updatedTasks.sort((a, b) => a.position - b.position));
        
        try {
            await supabaseService.updateTask(taskId, { status_id: newStatusId, position: newPosition });
            // Optionally re-fetch to confirm, but optimistic is usually enough
        } catch (error) {
            // Revert on error
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