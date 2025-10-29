import { useState, useEffect, useCallback } from 'react';
import { Task, TaskStatus } from '../types';
import { dataService } from '../services/dataService';
import { toast } from './use-toast';

export function useProductionKanban() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [statuses, setStatuses] = useState<TaskStatus[]>([]);
    const [isLoading, setIsLoading] = useState(true);

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
        // This functionality will work in sandbox due to mock implementation
        console.warn(`[Kanban] Attempting to move task ${taskId}. This is a mock operation.`);
        toast({ title: "Funcionalidade Indisponível", description: "O Kanban de produção está em modo de visualização." });
    }, []);

    return {
        tasks,
        statuses,
        isLoading,
        moveTask,
    };
}
