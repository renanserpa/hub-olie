import { useState, useEffect, useMemo, useCallback } from 'react';
import { InventoryBalance, InventoryMovement, BasicMaterial, InventoryMovementReason, InventoryMovementType } from '../types';
import { dataService } from '../services/dataService';
import { toast } from './use-toast';

export function useInventory() {
    const [allBalances, setAllBalances] = useState<InventoryBalance[]>([]);
    const [allMaterials, setAllMaterials] = useState<BasicMaterial[]>([]);
    const [movements, setMovements] = useState<InventoryMovement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoadingMovements, setIsLoadingMovements] = useState(false);
    
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [balancesData, materialsData] = await Promise.all([
                dataService.getCollection<InventoryBalance>('inventory_balances', '*, material:config_basic_materials(*)'),
                dataService.getCollection<BasicMaterial>('config_basic_materials')
            ]);
            
            setAllBalances(balancesData);
            setAllMaterials(materialsData);
            
            if (balancesData.length > 0 && selectedMaterialId === null) {
                setSelectedMaterialId(balancesData[0].material_id);
            } else if (balancesData.length === 0) {
                setSelectedMaterialId(null);
            }
        } catch (error) {
            toast({ title: "Erro!", description: "Não foi possível carregar o estoque.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, [selectedMaterialId]);

    useEffect(() => {
        const listener = dataService.listenToCollection<InventoryBalance>('inventory_balances', '*, material:config_basic_materials(*)', (data) => {
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

    const filteredBalances = useMemo(() => {
        if (!searchQuery) {
            return allBalances;
        }
        const lowercasedQuery = searchQuery.toLowerCase();
        return allBalances.filter(balance =>
            balance.material?.name.toLowerCase().includes(lowercasedQuery) ||
            balance.material?.codigo.toLowerCase().includes(lowercasedQuery)
        );
    }, [allBalances, searchQuery]);

    const selectedBalance = useMemo(() => {
        return allBalances.find(b => b.material_id === selectedMaterialId) || null;
    }, [allBalances, selectedMaterialId]);

    const createMovement = useCallback(async (movementData: any) => {
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

    return {
        isLoading,
        isLoadingMovements,
        isSaving,
        filteredBalances,
        searchQuery,
        setSearchQuery,
        selectedBalance,
        setSelectedMaterialId,
        movements,
        createMovement,
        allMaterials,
    };
}
