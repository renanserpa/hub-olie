import { useState, useEffect, useMemo, useCallback } from 'react';
import { InventoryBalance, InventoryMovement, Material, Warehouse, InventoryMovementReason, InventoryMovementType } from '../types';
import { dataService } from '../services/dataService';
import { toast } from './use-toast';

export function useInventory() {
    const [allBalances, setAllBalances] = useState<InventoryBalance[]>([]);
    const [allMaterials, setAllMaterials] = useState<Material[]>([]);
    const [allWarehouses, setAllWarehouses] = useState<Warehouse[]>([]);
    const [movements, setMovements] = useState<InventoryMovement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoadingMovements, setIsLoadingMovements] = useState(false);
    
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [balancesData, materialsData, warehousesData] = await Promise.all([
                dataService.getCollection<InventoryBalance>('inventory_balances', '*, material:config_materials(*), warehouse:warehouses(*)'),
                dataService.getCollection<Material>('config_materials'),
                dataService.getCollection<Warehouse>('warehouses'),
            ]);
            
            setAllBalances(balancesData);
            setAllMaterials(materialsData);
            setAllWarehouses(warehousesData);
            
            if (materialsData.length > 0 && selectedMaterialId === null) {
                setSelectedMaterialId(materialsData[0].id);
            } else if (materialsData.length === 0) {
                setSelectedMaterialId(null);
            }
        } catch (error) {
            toast({ title: "Erro!", description: "Não foi possível carregar o estoque.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, [selectedMaterialId]);

    useEffect(() => {
        const listener = dataService.listenToCollection<InventoryBalance>('inventory_balances', '*, material:config_materials(*), warehouse:warehouses(*)', (data) => {
            setAllBalances(data);
        });
        loadData();
        return () => listener.unsubscribe();
    }, [loadData]);
    
    useEffect(() => {
        const fetchMovements = async () => {
            if (!selectedMaterialId) {
                setMovements([]);
                return;
            }
            setIsLoadingMovements(true);
            try {
                const movementsData = await dataService.getInventoryMovements(selectedMaterialId);
                setMovements(movementsData);
            } catch (error) {
                 toast({ title: 'Erro!', description: 'Não foi possível carregar os movimentos.', variant: 'destructive' });
            } finally {
                setIsLoadingMovements(false);
            }
        };
        fetchMovements();
        
         const listener = dataService.listenToCollection<InventoryMovement>(`inventory_movements?material_id=eq.${selectedMaterialId}`, undefined, (data) => {
             setMovements(data.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
        });
        return () => listener.unsubscribe();

    }, [selectedMaterialId]);

    const aggregatedBalances = useMemo(() => {
        const materialMap = new Map<string, { material: Material, current_stock: number, reserved_stock: number }>();

        allBalances.forEach(balance => {
            if (!balance.material) return;
            
            if (!materialMap.has(balance.material_id)) {
                materialMap.set(balance.material_id, {
                    material: balance.material,
                    current_stock: 0,
                    reserved_stock: 0,
                });
            }
            
            const entry = materialMap.get(balance.material_id)!;
            entry.current_stock += balance.current_stock;
            entry.reserved_stock += balance.reserved_stock;
        });

        const filtered = Array.from(materialMap.values());
        
        if (!searchQuery) {
            return filtered;
        }
        const lowercasedQuery = searchQuery.toLowerCase();
        return filtered.filter(balance =>
            balance.material.name.toLowerCase().includes(lowercasedQuery) ||
            balance.material.sku?.toLowerCase().includes(lowercasedQuery)
        );
    }, [allBalances, searchQuery]);
    
    const balancesByMaterial = useMemo(() => {
        if (!selectedMaterialId) return null;
        
        const material = allMaterials.find(m => m.id === selectedMaterialId);
        if (!material) return null;

        const balances = allBalances.filter(b => b.material_id === selectedMaterialId);
        
        return { material, balances };

    }, [allBalances, allMaterials, selectedMaterialId]);

    const kpiStats = useMemo(() => {
        const lowStockItems = aggregatedBalances.filter(b => (b.current_stock - b.reserved_stock) <= 10).length;
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // This is a simplified calculation, a real app would fetch movements for all materials
        const transfersThisMonth = movements.filter(m => m.type === 'transfer' && new Date(m.created_at) >= firstDayOfMonth).length;

        return {
            totalValue: 0, // Placeholder, would need material cost
            lowStockItems,
            totalItems: allMaterials.length,
            transfersThisMonth,
        };
    }, [aggregatedBalances, allMaterials.length, movements]);


    const addInventoryMovement = useCallback(async (movementData: any) => {
        setIsSaving(true);
        try {
            await dataService.addInventoryMovement(movementData);
            toast({ title: 'Sucesso!', description: 'Movimento de estoque registrado.' });
        } catch (error) {
            toast({ title: 'Erro!', description: 'Não foi possível registrar o movimento.', variant: 'destructive' });
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, []);
    
    const transferStock = useCallback(async (transferData: any) => {
        setIsSaving(true);
        try {
            await dataService.transferStock(transferData);
             toast({ title: 'Sucesso!', description: 'Transferência de estoque registrada.' });
        } catch (error) {
            toast({ title: 'Erro!', description: 'Não foi possível registrar a transferência.', variant: 'destructive' });
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, []);

    return {
        isLoading,
        isLoadingMovements,
        isSaving,
        aggregatedBalances,
        searchQuery,
        setSearchQuery,
        balancesByMaterial,
        setSelectedMaterialId,
        movements,
        addInventoryMovement,
        transferStock,
        allMaterials,
        allWarehouses,
        kpiStats,
    };
}
