'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { ProductionOrder, ProductionOrderStatus, Material, ProductionTask, ProductionQualityCheck, ProductionTaskStatus, QualityCheckResult, Product, ProductVariant } from '../../types';
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

    const reload = useCallback(async () => {
        setIsLoading(true);
        try {
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
        return allOrders.map(order => {
            const variant = order.variant_sku ? allVariants.find(v => v.sku === order.variant_sku) : undefined;
            return {
                ...order,
                variant,
                tasks: allTasks.filter(t => t.production_order_id === order.id),
                quality_checks: allQualityChecks.filter(q => q.production_order_id === order.id),
            };
        });
    }, [allOrders, allTasks, allQualityChecks, allVariants]);
    
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
        // ... implementation
        setIsSaving(false);
    };
    
    const updateProductionOrderStatus = async (orderId: string, status: ProductionOrderStatus) => {
        setIsSaving(true);
        // ... implementation
        setIsSaving(false);
    };

    const createProductionOrder = async (orderData: Partial<Omit<ProductionOrder, 'id' | 'created_at' | 'updated_at'>>) => {
        // ... implementation
    };

    const createQualityCheck = async (check: Omit<ProductionQualityCheck, 'id' | 'created_at'>) => {
       // ... implementation
    };
    
    const clearFilters = () => {
        setFilters({ search: '', status: [] });
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
        reload,
    };
}