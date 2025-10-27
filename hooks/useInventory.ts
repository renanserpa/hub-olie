
import { useState, useEffect, useMemo, useCallback } from 'react';
import { InventoryBalance, InventoryMovement, BasicMaterial } from '../types';
import { firestoreService } from '../services/firestoreService';
import { toast } from './use-toast';

export function useInventory(onDataChange: () => void) {
    const [allBalances, setAllBalances] = useState<InventoryBalance[]>([]);
    const [allMaterials, setAllMaterials] = useState<BasicMaterial[]>([]);
    const [movements, setMovements] = useState<InventoryMovement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMovements, setIsLoadingMovements] = useState(false);
    
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [balancesData, materialsData] = await Promise.all([
                firestoreService.getInventoryBalances(),
                firestoreService.getAllBasicMaterials()
            ]);
            setAllBalances(balancesData);
            setAllMaterials(materialsData);
            if (balancesData.length > 0 && !selectedMaterialId) {
                setSelectedMaterialId(balancesData[0].material_id);
            }
        } catch (error) {
            toast({ title: "Erro!", description: "Não foi possível carregar o estoque.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, [selectedMaterialId]);

    useEffect(() => {
        loadData();
    }, [onDataChange]); // Rely on parent to trigger reload

    useEffect(() => {
        const fetchMovements = async () => {
            if (!selectedMaterialId) {
                setMovements([]);
                return;
            }
            setIsLoadingMovements(true);
            try {
                const movementsData = await firestoreService.getInventoryMovements(selectedMaterialId);
                setMovements(movementsData);
            } catch (error) {
                 toast({ title: 'Erro!', description: 'Não foi possível carregar os movimentos.', variant: 'destructive' });
            } finally {
                setIsLoadingMovements(false);
            }
        };
        fetchMovements();
    }, [selectedMaterialId]);

    const filteredBalances = useMemo(() => {
        return allBalances.filter(balance => {
            const material = balance.material;
            if (!material) return false;
            const query = searchQuery.toLowerCase();
            return material.name.toLowerCase().includes(query) || material.codigo.toLowerCase().includes(query);
        });
    }, [allBalances, searchQuery]);
    
    const selectedBalance = useMemo(() => {
        return allBalances.find(b => b.material_id === selectedMaterialId) || null;
    }, [allBalances, selectedMaterialId]);


    const addInventoryMovement = async (movementData: Omit<InventoryMovement, 'id' | 'created_at'>) => {
        try {
            await firestoreService.addInventoryMovement(movementData);
            toast({ title: "Sucesso!", description: "Movimento de estoque registrado." });
            onDataChange(); // Trigger a full data refresh
        } catch (error) {
            toast({ title: "Erro!", description: "Não foi possível registrar o movimento.", variant: "destructive" });
        }
    };
    
    // Auto-select first item if current selection is filtered out
     useEffect(() => {
        if(selectedMaterialId && !filteredBalances.find(b => b.material_id === selectedMaterialId)) {
             setSelectedMaterialId(filteredBalances[0]?.material_id || null);
        }
    }, [filteredBalances, selectedMaterialId]);

    return {
        isLoading,
        isLoadingMovements,
        filteredBalances,
        searchQuery,
        setSearchQuery,
        selectedBalance,
        setSelectedMaterialId,
        movements,
        addInventoryMovement,
        allMaterials,
    };
}