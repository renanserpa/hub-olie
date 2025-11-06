import { useState, useEffect, useMemo, useCallback } from 'react';
import { ProductionOrder, ProductionOrderStatus, Material, ProductionTask, ProductionQualityCheck, ProductionTaskStatus, QualityCheckResult, Product, ProductVariant } from '../types';
import { dataService } from '../services/dataService';
import { toast } from './use-toast';

export type ProductionViewMode = 'kanban' | 'list' | 'table';

export function useProduction() {
    const [allOrders, setAllOrders] = useState<ProductionOrder[]>([]);
    const [allTasks, setAllTasks] = useState<ProductionTask[]>([]);
    const [allQualityChecks, setAllQualityChecks] = useState<ProductionQualityCheck[]>([]);
    const [allMaterials, setAllMaterials] = useState<Material[]>([]);
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    // FIX: Add state for product variants
    const [allVariants, setAllVariants] = useState<ProductVariant[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [filters, setFilters] = useState<{ search: string; status: ProductionOrderStatus[] }>({ search: '', status: [] });

    const [viewMode, setViewModeInternal] = useState<ProductionViewMode>('kanban');
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

     useEffect(() => {
        const savedViewMode = sessionStorage.getItem('productionViewMode') as ProductionViewMode;
        if (savedViewMode) {
            setViewModeInternal(savedViewMode);
        }
    }, []);

    const setViewMode = (mode: ProductionViewMode) => {
        sessionStorage.setItem('productionViewMode', mode);
        setViewModeInternal(mode);
    };

    const reload = useCallback(async () => {
        setIsLoading(true);
        try {
            // FIX: Fetch product variants along with other production data.
            const [ordersData, tasksData, qualityData, materialsData, productsData, variantsData] = await Promise.all([
                dataService.getCollection<ProductionOrder>('production_orders', '*, product:products(*)'),
                dataService.getCollection<ProductionTask>('production_tasks'),
                dataService.getCollection<ProductionQualityCheck>('production_quality_checks'),
                dataService.getCollection<Material>('config_materials'),
                dataService.getCollection<Product>('products'),
                dataService.getCollection<ProductVariant>('product_variants'),
            ]);
            
            setAllOrders(ordersData);
            setAllTasks(tasksData);
            setAllQualityChecks(qualityData);
            setAllMaterials(materialsData);
            setAllProducts(productsData);
            setAllVariants(variantsData);

        } catch (error) {
            toast({ title: "Erro!", description: "Não foi possível carregar os dados de produção.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        reload();
    }, [reload]);

    const ordersWithDetails = useMemo(() => {
        return allOrders.map(order => ({
            ...order,
            // FIX: Add variant details to each order.
            variant: allVariants.find(v => v.sku === order.variant_sku),
            tasks: allTasks.filter(t => t.production_order_id === order.id),
            quality_checks: allQualityChecks.filter(q => q.production_order_id === order.id),
        }));
    // FIX: Add allVariants to the dependency array.
    }, [allOrders, allTasks, allQualityChecks, allVariants]);
    
    const filteredOrders = useMemo(() => {
        return ordersWithDetails.filter(order => {
            const searchMatch = filters.search === '' || 
                                order.po_number.toLowerCase().includes(filters.search.toLowerCase()) || 
                                (order.product && order.product.name.toLowerCase().includes(filters.search.toLowerCase()));
            
            const statusMatch = filters.status.length === 0 || filters.status.includes(order.status);
            
            return searchMatch && statusMatch;
        });
    }, [ordersWithDetails, filters]);

    const selectedOrder = useMemo(() => {
        return filteredOrders.find(o => o.id === selectedOrderId) || null;
    }, [filteredOrders, selectedOrderId]);

    const kpis = useMemo(() => {
        const openOrders = allOrders.filter(o => o.status === 'em_andamento' || o.status === 'em_espera').length;
        const completedToday = allOrders.filter(o => o.completed_at && new Date(o.completed_at).toDateString() === new Date().toDateString()).length;
        const overdue = allOrders.filter(o => new Date(o.due_date) < new Date() && o.status !== 'finalizado' && o.status !== 'cancelado').length;
        
        const qcChecks = allQualityChecks;
        const approvedChecks = qcChecks.filter(q => q.result === 'Aprovado').length;
        const qualityApprovalRate = qcChecks.length > 0 ? (approvedChecks / qcChecks.length) * 100 : 100;

        return {
            openOrders,
            completedToday,
            overdue,
            qualityApprovalRate: qualityApprovalRate.toFixed(0) + '%',
        };
    }, [allOrders, allQualityChecks]);
    
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
            await reload();
        } catch (error) {
            toast({ title: "Erro!", description: "Não foi possível atualizar o status da tarefa.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };
    
    const updateProductionOrderStatus = async (orderId: string, status: ProductionOrderStatus) => {
        setIsSaving(true);
        const order = allOrders.find(o => o.id === orderId);
        if (!order) {
            setIsSaving(false);
            return;
        }
        
        // Optimistic update for UI
        setAllOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));

        try {
            await dataService.updateProductionOrderStatus(orderId, status);
            toast({ title: "Sucesso!", description: `Status da OP #${order.po_number} atualizado.` });
            await reload(); // Reload to get all data changes from triggers
        } catch (error) {
            toast({ title: "Erro!", description: "Não foi possível atualizar o status da OP.", variant: "destructive" });
            // Revert optimistic update on failure by reloading
            await reload();
        } finally {
            setIsSaving(false);
        }
    };

    const createProductionOrder = async (orderData: Partial<Omit<ProductionOrder, 'id' | 'created_at' | 'updated_at'>>) => {
        setIsSaving(true);
        try {
            const po_number = `OP-MAN-${Date.now().toString().slice(-6)}`;
            await dataService.addDocument('production_orders', { ...orderData, po_number, status: 'novo' });
            toast({ title: "Sucesso!", description: "Nova Ordem de Produção criada." });
            setIsCreateDialogOpen(false);
            reload();
        } catch(e) {
            toast({ title: "Erro!", description: "Não foi possível criar a Ordem de Produção.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    const createQualityCheck = async (check: Omit<ProductionQualityCheck, 'id' | 'created_at'>) => {
        setIsSaving(true);
        try {
            await dataService.addDocument<ProductionQualityCheck>('production_quality_checks', {
                ...check,
                created_at: new Date().toISOString()
            });
            toast({ title: "Sucesso!", description: "Inspeção de qualidade registrada." });
            await reload();
        } catch(e) {
             toast({ title: "Erro!", description: "Não foi possível registrar a inspeção.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    return {
        allOrders: ordersWithDetails,
        filteredOrders,
        allMaterials,
        allProducts,
        isLoading,
        isSaving,
        selectedOrder,
        setSelectedOrderId,
        kpis,
        filters,
        setFilters,
        updateTaskStatus,
        updateProductionOrderStatus,
        createQualityCheck,
        createProductionOrder,
        viewMode,
        setViewMode,
        isCreateDialogOpen,
        setIsCreateDialogOpen,
        reload,
    };
}