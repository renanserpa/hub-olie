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
    const [allVariants, setAllVariants] = useState<ProductVariant[]>([]);
    const [allRoutes, setAllRoutes] = useState<ProductionRoute[]>([]);
    const [allMolds, setAllMolds] = useState<MoldLibrary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [filters, setFilters] = useState<{
        search: string;
        status: ProductionOrderStatus[];
        productId?: string;
        startDate?: string;
        endDate?: string;
        minQty?: number | '';
        maxQty?: number | '';
    }>({ search: '', status: [] });
    const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);

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

    const loadAuxData = useCallback(async () => {
        try {
            const [materialsData, productsData, variantsData, suppliersData, routesData, moldsData] = await Promise.all([
                dataService.getCollection<Material>('config_materials'),
                dataService.getCollection<Product>('products'),
                dataService.getCollection<ProductVariant>('product_variants'),
                dataService.getCollection<Supplier>('suppliers'),
                dataService.getProductionRoutes(),
                dataService.getMoldLibrary(),
            ]);
            
            const suppliersById = new Map(suppliersData.map(s => [s.id, s]));
            const enrichedMaterials = materialsData.map(material => {
                if (material.supplier_id) {
                    return { ...material, supplier: suppliersById.get(material.supplier_id) };
                }
                return material;
            });

            setAllMaterials(enrichedMaterials);
            setAllProducts(productsData);
            setAllVariants(variantsData);
            setAllRoutes(routesData);
            setAllMolds(moldsData);
        } catch (error) {
             toast({ title: "Erro!", description: "Não foi possível carregar os dados de apoio de produção.", variant: "destructive" });
        }
    }, []);


    useEffect(() => {
        setIsLoading(true);
        loadAuxData();

        const ordersListener = dataService.listenToCollection('production_orders', '*, product:products(*)', (data) => {
            setAllOrders(data as ProductionOrder[]);
            setIsLoading(false);
        });
        const tasksListener = dataService.listenToCollection('production_tasks', undefined, (data) => {
            setAllTasks(data as ProductionTask[]);
        });
        const qualityListener = dataService.listenToCollection('production_quality_checks', undefined, (data) => {
            setAllQualityChecks(data as ProductionQualityCheck[]);
        });

        return () => {
            ordersListener.unsubscribe();
            tasksListener.unsubscribe();
            qualityListener.unsubscribe();
        };
    }, [loadAuxData]);

    const ordersWithDetails = useMemo(() => {
        return allOrders.map(order => {
            const variant = order.variant_sku ? allVariants.find(v => v.sku === order.variant_sku) : undefined;
            const product = allProducts.find(p => p.id === order.product_id);
            const sizeName = variant?.configuration.size ? product?.available_sizes?.find(s => s.id === variant.configuration.size)?.name : undefined;
            
            return {
                ...order,
                variant,
                product,
                route: allRoutes.find(r => r.produto.toLowerCase() === product?.name.toLowerCase() && r.tamanho === sizeName),
                tasks: allTasks.filter(t => t.production_order_id === order.id),
                quality_checks: allQualityChecks.filter(q => q.production_order_id === order.id),
            };
        });
    }, [allOrders, allTasks, allQualityChecks, allVariants, allProducts, allRoutes]);
    
    const filteredOrders = useMemo(() => {
        return ordersWithDetails.filter(order => {
            const searchMatch = filters.search === '' || 
                                order.po_number.toLowerCase().includes(filters.search.toLowerCase()) || 
                                (order.product && order.product.name.toLowerCase().includes(filters.search.toLowerCase()));
            
            const statusMatch = filters.status.length === 0 || filters.status.includes(order.status);

            const productMatch = !filters.productId || order.product_id === filters.productId;
            const startDateMatch = !filters.startDate || new Date(order.created_at) >= new Date(filters.startDate);
            const endDateMatch = !filters.endDate || new Date(order.created_at) <= new Date(filters.endDate);
            const minQtyMatch = filters.minQty === '' || filters.minQty === undefined || order.quantity >= filters.minQty;
            const maxQtyMatch = filters.maxQty === '' || filters.maxQty === undefined || order.quantity <= filters.maxQty;
            
            return searchMatch && statusMatch && productMatch && startDateMatch && endDateMatch && minQtyMatch && maxQtyMatch;
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
            // FIX: Explicitly specify the generic type for updateDocument to resolve incorrect type inference by TypeScript.
            await dataService.updateDocument<ProductionTask>('production_tasks', taskId, updateData);
            toast({ title: "Sucesso!", description: `Tarefa "${task.name}" atualizada para "${status}".` });
            // Realtime will handle refresh
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
        } catch (error) {
            toast({ title: "Erro!", description: "Não foi possível atualizar o status da OP.", variant: "destructive" });
            // Revert optimistic update on failure by reloading
            setAllOrders(allOrders);
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
            // Realtime will handle refresh
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
            // Realtime will handle refresh
        } catch(e) {
             toast({ title: "Erro!", description: "Não foi possível registrar a inspeção.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };
    
    const clearFilters = () => {
        setFilters({ search: '', status: [], productId: '', startDate: '', endDate: '', minQty: '', maxQty: '' });
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
        isAdvancedFilterOpen,
        setIsAdvancedFilterOpen,
        clearFilters,
        reload: loadAuxData, // Expose aux data reload
    };
}
