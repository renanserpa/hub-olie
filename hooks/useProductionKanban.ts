

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
        // This functionality is disabled because the 'tasks' table does not exist.
        console.warn(`[Kanban] Tentativa de mover a tarefa ${taskId} foi ignorada pois a tabela 'tasks' não existe.`);
        toast({ title: "Funcionalidade Indisponível", description: "O Kanban de produção está em modo de visualização." });
    }, []);

    return {
        tasks,
        statuses,
        isLoading,
        moveTask,
    };
}