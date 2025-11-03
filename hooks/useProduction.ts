import { useState, useEffect, useMemo, useCallback } from 'react';
import { ProductionOrder, ProductionOrderStatus, Material, ProductionTask, ProductionQualityCheck, ProductionTaskStatus, QualityCheckResult } from '../types';
import { dataService } from '../services/dataService';
import { toast } from './use-toast';

export function useProduction() {
    const [allOrders, setAllOrders] = useState<ProductionOrder[]>([]);
    const [allTasks, setAllTasks] = useState<ProductionTask[]>([]);
    const [allQualityChecks, setAllQualityChecks] = useState<ProductionQualityCheck[]>([]);
    const [allMaterials, setAllMaterials] = useState<Material[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [ordersData, tasksData, qualityData, materialsData] = await Promise.all([
                dataService.getCollection<ProductionOrder>('production_orders', '*, product:products(*)'),
                dataService.getCollection<ProductionTask>('production_tasks'),
                dataService.getCollection<ProductionQualityCheck>('production_quality_checks'),
                dataService.getCollection<Material>('config_materials')
            ]);
            
            setAllOrders(ordersData);
            setAllTasks(tasksData);
            setAllQualityChecks(qualityData);
            setAllMaterials(materialsData);

            if (ordersData.length > 0 && !selectedOrderId) {
                setSelectedOrderId(ordersData[0].id);
            }
        } catch (error) {
            toast({ title: "Erro!", description: "Não foi possível carregar os dados de produção.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, [selectedOrderId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const ordersWithDetails = useMemo(() => {
        return allOrders.map(order => ({
            ...order,
            tasks: allTasks.filter(t => t.production_order_id === order.id),
            quality_checks: allQualityChecks.filter(q => q.production_order_id === order.id),
        }));
    }, [allOrders, allTasks, allQualityChecks]);
    
    const selectedOrder = useMemo(() => {
        return ordersWithDetails.find(o => o.id === selectedOrderId) || null;
    }, [ordersWithDetails, selectedOrderId]);

    const kpis = useMemo(() => {
        const openOrders = allOrders.filter(o => o.status === 'em_andamento' || o.status === 'em_espera').length;
        const completedToday = allOrders.filter(o => o.completed_at && new Date(o.completed_at).toDateString() === new Date().toDateString()).length;
        const overdue = allOrders.filter(o => new Date(o.due_date) < new Date() && o.status !== 'finalizado' && o.status !== 'cancelado').length;
        // Simplified efficiency. A real one would be more complex.
        const efficiency = allOrders.length > 0 ? ((allOrders.length - overdue) / allOrders.length) * 100 : 100;

        return {
            openOrders,
            completedToday,
            overdue,
            efficiency: efficiency.toFixed(0) + '%',
        };
    }, [allOrders]);
    
    const updateTaskStatus = async (taskId: string, status: ProductionTaskStatus) => {
        setIsSaving(true);
        const task = allTasks.find(t => t.id === taskId);
        if (!task) {
            toast({ title: "Erro", description: "Tarefa não encontrada.", variant: "destructive" });
            setIsSaving(false);
            return;
        }

        const updateData: Partial<ProductionTask> = { status };
        if (status === 'Em Andamento' && !task.started_at) {
            updateData.started_at = new Date().toISOString();
        } else if (status === 'Concluída' && !task.finished_at) {
            updateData.finished_at = new Date().toISOString();
        }

        try {
            await dataService.updateDocument<ProductionTask>('production_tasks', taskId, updateData);
            toast({ title: "Sucesso!", description: `Tarefa "${task.name}" atualizada para "${status}".` });
            await loadData();
        } catch (error) {
            toast({ title: "Erro!", description: "Não foi possível atualizar o status da tarefa.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };
    
    const createQualityCheck = async (check: Omit<ProductionQualityCheck, 'id' | 'created_at'>) => {
        setIsSaving(true);
        try {
// @fix: Added `created_at` to the object passed to `addDocument` to satisfy the type requirements.
            await dataService.addDocument<ProductionQualityCheck>('production_quality_checks', {
                ...check,
                created_at: new Date().toISOString()
            });
            toast({ title: "Sucesso!", description: "Inspeção de qualidade registrada." });
            await loadData();
        } catch(e) {
             toast({ title: "Erro!", description: "Não foi possível registrar a inspeção.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    return {
        allOrders: ordersWithDetails,
        allMaterials,
        isLoading,
        isSaving,
        selectedOrder,
        setSelectedOrderId,
        kpis,
        updateTaskStatus,
        createQualityCheck,
    };
}