import { useState, useEffect, useMemo, useCallback } from 'react';
import { InventoryBalance, InventoryMovement, Material, Warehouse, ProductVariant, Supplier } from '../types';
import { dataService } from '../services/dataService';
import { toast } from './use-toast';

export function useInventory() {
    const [allBalances, setAllBalances] = useState<InventoryBalance[]>([]);
    const [allMaterials, setAllMaterials] = useState<Material[]>([]);
    const [allVariants, setAllVariants] = useState<ProductVariant[]>([]);
    const [allWarehouses, setAllWarehouses] = useState<Warehouse[]>([]);
    const [movements, setMovements] = useState<InventoryMovement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoadingMovements, setIsLoadingMovements] = useState(false);
    
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
    const [selectedItemType, setSelectedItemType] = useState<'material' | 'product'>('material');

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [balancesData, materialsData, variantsData, warehousesData, suppliersData] = await Promise.all([
                dataService.getCollection<InventoryBalance>('inventory_balances', '*, material:config_materials(*), product_variant:product_variants(*), warehouse:warehouses(*)'),
                dataService.getCollection<Material>('config_materials'),
                dataService.getCollection<ProductVariant>('product_variants'),
                dataService.getCollection<Warehouse>('warehouses'),
                dataService.getCollection<Supplier>('suppliers'),
            ]);
            
            const suppliersById = new Map(suppliersData.map(s => [s.id, s]));
            const enrichedBalances = balancesData.map(balance => {
                if (balance.material && balance.material.supplier_id) {
                    balance.material.supplier = suppliersById.get(balance.material.supplier_id);
                }
                return balance;
            });

            setAllBalances(enrichedBalances);
            setAllMaterials(materialsData);
            setAllVariants(variantsData);
            setAllWarehouses(warehousesData);
            
        } catch (error) {
            toast({ title: "Erro!", description: "Não foi possível carregar o estoque.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();

        const handleDataChange = () => {
            console.log('Realtime update detected in inventory module, refreshing...');
            loadData();
        };

        // FIX: Added the 4th argument to match the expected signature of `listenToCollection`.
        const balanceListener = dataService.listenToCollection('inventory_balances', undefined, handleDataChange, setAllBalances);
        // FIX: Added the 4th argument to match the expected signature of `listenToCollection`.
        const movementListener = dataService.listenToCollection('inventory_movements', undefined, handleDataChange, setMovements);

        return () => {
            balanceListener.unsubscribe();
            movementListener.unsubscribe();
        };
    }, [loadData]);
    
    useEffect(() => {
        const fetchMovements = async () => {
            if (!selectedItemId) {
                setMovements([]);
                return;
            }
            setIsLoadingMovements(true);
            try {
                // FIX: Pass both selectedItemId and selectedItemType to dataService
                const movementsData = await dataService.getInventoryMovements(selectedItemId, selectedItemType);
                setMovements(movementsData);
            } catch (error) {
                 toast({ title: 'Erro!', description: 'Não foi possível carregar os movimentos.', variant: 'destructive' });
            } finally {
                setIsLoadingMovements(false);
            }
        };
        fetchMovements();
    }, [selectedItemId, selectedItemType]);

    const materialBalances = useMemo(() => {
        const materialMap = new Map<string, { material: Material, current_stock: number, reserved_stock: number }>();
        allBalances.filter(b => b.material_id).forEach(balance => {
            if (!balance.material) return;
            if (!materialMap.has(balance.material_id)) {
                materialMap.set(balance.material_id, { material: balance.material, current_stock: 0, reserved_stock: 0 });
            }
            const entry = materialMap.get(balance.material_id)!;
            entry.current_stock += balance.current_stock;
            entry.reserved_stock += balance.reserved_stock;
        });
        const filtered = Array.from(materialMap.values());
        if (!searchQuery) return filtered;
        return filtered.filter(b => b.material.name.toLowerCase().includes(searchQuery.toLowerCase()) || b.material.sku?.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [allBalances, searchQuery]);
    
    const productBalances = useMemo(() => {
        const variantMap = new Map<string, { item: ProductVariant, current_stock: number, reserved_stock: number }>();
         allBalances.filter(b => b.product_variant_id).forEach(balance => {
            const variant = allVariants.find(v => v.id === balance.product_variant_id);
            if (!variant) return;
            if (!variantMap.has(variant.id)) {
                variantMap.set(variant.id, { item: variant, current_stock: 0, reserved_stock: 0 });
            }
            const entry = variantMap.get(variant.id)!;
            entry.current_stock += balance.current_stock;
            entry.reserved_stock += balance.reserved_stock;
        });
        const filtered = Array.from(variantMap.values());
        if (!searchQuery) return filtered;
        return filtered.filter(b => b.item.name.toLowerCase().includes(searchQuery.toLowerCase()) || b.item.sku.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [allBalances, allVariants, searchQuery]);
    
    const selectedItemDetails = useMemo(() => {
        if (!selectedItemId) return null;
        
        const balances = allBalances.filter(b => (selectedItemType === 'material' ? b.material_id : b.product_variant_id) === selectedItemId);
        let item: Material | ProductVariant | undefined;
        if(selectedItemType === 'material') {
            item = allMaterials.find(m => m.id === selectedItemId);
        } else {
            item = allVariants.find(v => v.id === selectedItemId);
        }

        if (!item) return null;

        return { item, balances };

    }, [allBalances, allMaterials, allVariants, selectedItemId, selectedItemType]);

    const kpiStats = useMemo(() => {
        // FIX: Correctly access stock levels from the aggregated balance object, not the material definition.
        const lowStockItems = materialBalances.filter(b => (b.current_stock - b.reserved_stock) <= (b.material.low_stock_threshold || 10)).length;
        const totalValue = allBalances.reduce((sum, balance) => {
            const item = balance.material || allVariants.find(v => v.id === balance.product_variant_id);
            const price = (item as Material)?.default_cost || (item as ProductVariant)?.final_price || 0;
            return sum + (balance.current_stock * price);
        }, 0);

        return {
            totalValue,
            lowStockItems,
            totalItems: allMaterials.length + allVariants.length,
            transfersThisMonth: 0, // Simplified for now
        };
    }, [materialBalances, allBalances, allMaterials, allVariants]);


    const addInventoryMovement = useCallback(async (movementData: any) => {
        setIsSaving(true);
        try {
            await dataService.addInventoryMovement(movementData);
            toast({ title: 'Sucesso!', description: 'Movimento de estoque registrado.' });
            loadData();
        } catch (error) {
            toast({ title: 'Erro!', description: 'Não foi possível registrar o movimento.', variant: 'destructive' });
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [loadData]);
    
    const transferStock = useCallback(async (transferData: any) => {
        setIsSaving(true);
        try {
            await dataService.transferStock(transferData);
             toast({ title: 'Sucesso!', description: 'Transferência de estoque registrada.' });
             loadData();
        } catch (error) {
            toast({ title: 'Erro!', description: 'Não foi possível registrar a transferência.', variant: 'destructive' });
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [loadData]);
    
    const selectItem = (id: string, type: 'material' | 'product') => {
        setSelectedItemId(id);
        setSelectedItemType(type);
    };

    return {
        isLoading,
        isLoadingMovements,
        isSaving,
        materialBalances,
        productBalances,
        searchQuery,
        setSearchQuery,
        selectedItemDetails,
        selectItem,
        selectedItemId,
        selectedItemType,
        movements,
        addInventoryMovement,
        transferStock,
        allMaterials,
        allVariants,
        allWarehouses,
        kpiStats,
    };
}