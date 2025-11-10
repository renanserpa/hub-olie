import { useState, useEffect, useMemo, useCallback } from 'react';
import { ProductionOrder, ProductionOrderStatus, Material, ProductionTask, ProductionQualityCheck, ProductionTaskStatus, QualityCheckResult, Product, ProductVariant, Supplier, ProductionRoute, MoldLibrary, AuthUser } from '../../types';
import { dataService } from '../../services/dataService';
import { toast } from '../../hooks/use-toast';

export type ProductionViewMode = 'kanban' | 'list' | 'table';

export function useProduction() {
    const [allOrders, setAllOrders] = useState<ProductionOrder[]>([]);
    const [allTasks, setAllTasks] = useState<ProductionTask[]>([]);
    const [allQualityChecks, setAllQualityChecks] = useState<ProductionQualityCheck[]>([]);
    const [allMaterials, setAllMaterials] = useState<Material[]>([]);
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<ProductionViewMode>('kanban');

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [orders, tasks, qualityChecks, materials, products] = await Promise.all([
                dataService.getCollection<ProductionOrder>('production_orders', '*, product:products(*)'),
                dataService.getCollection<ProductionTask>('production_tasks'),
                dataService.getCollection<ProductionQualityCheck>('production_quality_checks'),
                dataService.getCollection<Material>('config_materials'),
                dataService.getCollection<Product>('products'),
            ]);
            setAllOrders(orders as ProductionOrder[]);
            setAllTasks(tasks);
            setAllQualityChecks(qualityChecks);
            setAllMaterials(materials);
            setAllProducts(products);
        } catch (error) {
            toast({ title: "Erro!", description: "Não foi possível carregar os dados de produção.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
        const ordersListener = dataService.listenToCollection('production_orders', '*, product:products(*)', (data) => setAllOrders(data as ProductionOrder[]));
        const tasksListener = dataService.listenToCollection('production_tasks', undefined, (data) => setAllTasks(data as ProductionTask[]));
        const qualityListener = dataService.listenToCollection('production_quality_checks', undefined, (data) => setAllQualityChecks(data as ProductionQualityCheck[]));
        
        return () => {
            ordersListener.unsubscribe();
            tasksListener.unsubscribe();
            qualityListener.unsubscribe();
        };
    }, [loadData]);

    const ordersWithDetails = useMemo(() => {
        return allOrders.map(order => ({
            ...order,
            tasks: allTasks.filter(t => t.production_order_id === order.id).sort((a,b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()),
            quality_checks: allQualityChecks.filter(q => q.production_order_id === order.id).sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
        }));
    }, [allOrders, allTasks, allQualityChecks]);

    const selectedOrder = useMemo(() => {
        return ordersWithDetails.find(o => o.id === selectedOrderId) || null;
    }, [ordersWithDetails, selectedOrderId]);

    const kpis = useMemo(() => ({
        openOrders: allOrders.filter(o => o.status === 'em_andamento' || o.status === 'em_espera').length,
        completedToday: allOrders.filter(o => o.completed_at && new Date(o.completed_at).toDateString() === new Date().toDateString()).length,
        overdue: allOrders.filter(o => new Date(o.due_date) < new Date() && o.status !== 'finalizado' && o.status !== 'cancelado').length,
        qualityApprovalRate: (allQualityChecks.length > 0 ? (allQualityChecks.filter(q => q.result === 'Aprovado').length / allQualityChecks.length) * 100 : 100).toFixed(0) + '%',
    }), [allOrders, allQualityChecks]);

    const updateProductionOrderStatus = async (orderId: string, status: ProductionOrderStatus) => {
        setIsSaving(true);
        try {
            await dataService.updateProductionOrderStatus(orderId, status);
            toast({ title: "Sucesso!", description: `Ordem de Produção movida para "${status}".`});
        } catch (error) {
            toast({ title: "Erro!", description: "Não foi possível atualizar o status da OP.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };
    
    const updateTaskStatus = async (taskId: string, status: ProductionTaskStatus) => {
        setIsSaving(true);
        try {
            // FIX: Explicitly specify the generic type for updateDocument to resolve incorrect type inference by TypeScript.
            await dataService.updateDocument<ProductionTask>('production_tasks', taskId, { status });
            toast({ title: "Sucesso!", description: "Status da tarefa atualizado."});
        } catch (error) {
             toast({ title: "Erro!", description: "Não foi possível atualizar a tarefa.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    const createQualityCheck = async (checkData: Omit<ProductionQualityCheck, 'id'|'created_at'>) => {
        setIsSaving(true);
        try {
            await dataService.addDocument('production_quality_checks', checkData as any);
            toast({ title: "Sucesso!", description: "Controle de qualidade registrado."});
        } catch(e) {
             toast({ title: "Erro!", description: "Não foi possível registrar o CQ.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };
    

    return {
        isLoading,
        isSaving,
        filteredOrders: ordersWithDetails, // Simplified for now
        allMaterials,
        allProducts,
        selectedOrder,
        setSelectedOrderId,
        kpis,
        viewMode,
        setViewMode,
        updateProductionOrderStatus,
        updateTaskStatus,
        createQualityCheck
    };
}
