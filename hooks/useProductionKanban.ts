import { useState, useEffect, useCallback } from 'react';
import { Task, TaskStatus } from '../types';
import { dataService } from '../services/dataService';
import { toast } from './use-toast';
import { useAuth } from '../context/AuthContext';

export function useProductionKanban() {
    const { user } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [statuses, setStatuses] = useState<TaskStatus[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const isAuthorized = user?.role === 'AdminGeral' || user?.role === 'Producao';

    const loadKanbanData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [tasksData, statusesData] = await Promise.all([
                dataService.getTasks(),
                dataService.getTaskStatuses(),
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
        if (!isAuthorized) {
            toast({ title: "Acesso Negado", description: "Você não tem permissão para mover tarefas.", variant: "destructive" });
            return;
        }

        const originalTasks = tasks;
        const taskToMove = originalTasks.find(t => t.id === taskId);

        if (!taskToMove || taskToMove.status_id === newStatusId) {
            return; // No change needed or task not found
        }

        // Optimistic UI Update
        const updatedTasks = originalTasks.map(t =>
            t.id === taskId ? { ...t, status_id: newStatusId, position: newPosition } : t
        );
        setTasks(updatedTasks);

        // Persist change to backend
        try {
            await dataService.updateTask(taskId, { status_id: newStatusId, position: newPosition });
            // Success is implicit through the UI change
        } catch (error) {
            // Revert on failure
            toast({ title: "Erro de Sincronização", description: "Não foi possível mover a tarefa.", variant: "destructive" });
            setTasks(originalTasks);
        }
    }, [tasks, isAuthorized]);

    return {
        tasks,
        statuses,
        isLoading,
        moveTask,
    };
}