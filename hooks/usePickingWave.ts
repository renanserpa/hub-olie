import { useState, useEffect, useCallback } from 'react';
import { LogisticsPickTask } from '../types';
import { supabase } from '../lib/supabaseClient';
import { toast } from './use-toast';

export function usePickingWave(waveId: string) {
  const [tasks, setTasks] = useState<LogisticsPickTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    if (!waveId) return;
    setIsLoading(true);
    setError(null);
    try {
      // Fetch tasks specific to this wave
      const { data, error } = await supabase
        .from('logistics_pick_tasks')
        .select('*')
        .eq('wave_id', waveId)
        .order('product_name', { ascending: true });

      if (error) throw error;

      setTasks(data || []);
    } catch (err) {
      console.error('Error fetching picking tasks:', err);
      setError('Falha ao carregar as tarefas.');
      toast({ title: "Erro", description: "Não foi possível carregar as tarefas de picking.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [waveId]);

  useEffect(() => {
    fetchTasks();

    const channel = supabase
        .channel(`public:logistics_pick_tasks:wave_id=${waveId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'logistics_pick_tasks', filter: `wave_id=eq.${waveId}` }, () => {
            fetchTasks();
        })
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
  }, [fetchTasks, waveId]);

  const pickItem = useCallback(async (taskId: string, quantity: number) => {
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return;

    const originalTask = tasks[taskIndex];
    const newQuantityPicked = (originalTask.picked_quantity || 0) + quantity;
    
    if (newQuantityPicked > originalTask.quantity) {
         toast({ title: "Atenção", description: "Quantidade excede o necessário.", variant: "destructive" });
         return;
    }

    const newStatus = newQuantityPicked >= originalTask.quantity ? 'picked' : 'picking';

    // Optimistic UI update
    const updatedTasks = [...tasks];
    updatedTasks[taskIndex] = { 
        ...originalTask, 
        picked_quantity: newQuantityPicked, 
        status: newStatus 
    };
    setTasks(updatedTasks);

    try {
      const { error } = await supabase
        .from('logistics_pick_tasks')
        .update({
            picked_quantity: newQuantityPicked,
            status: newStatus,
            picked_at: newStatus === 'picked' ? new Date().toISOString() : null,
            // picker_id would ideally come from auth context
        })
        .eq('id', taskId);

      if (error) throw error;

      if (newStatus === 'picked') {
        toast({ title: "Item Completo", description: `Picking de ${originalTask.product_name} concluído!` });
      }
    } catch (err) {
      console.error('Error updating picking task:', err);
      setTasks(tasks); // Revert on error
      toast({ title: "Erro", description: "Falha ao registrar picking.", variant: "destructive" });
    }
  }, [tasks]);

  return {
    tasks,
    isLoading,
    error,
    pickItem,
    refresh: fetchTasks
  };
}