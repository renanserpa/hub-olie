

import { useState, useEffect, useMemo, useCallback } from 'react';
import { InventoryBalance, InventoryMovement, BasicMaterial } from '../types';
import { supabaseService } from '../services/supabaseService';
import { toast } from './use-toast';

export function useInventory() {
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
            // These functions are now safe and will return [] if tables don't exist
            const [balancesData, materialsData] = await Promise.all([
                supabaseService.getInventoryBalances(),
                // FIX: supabaseService will be updated to export getCollection
                supabaseService.getCollection<BasicMaterial>('config_basic_materials')
            ]);
            
            // Because inventory_balances doesn't exist, balancesData will be [].
            // We can enrich the materials with placeholder balance data for the UI to work.
            const enrichedBalances = materialsData.map(material => {
                const existingBalance = balancesData.find(b => b.material_id === material.id);
                if (existingBalance) return {...existingBalance, material};

                // Create a zero-state placeholder
                return {
                    material_id: material.id,
                    material: material,
                    quantity_on_hand: 0,
                    quantity_reserved: 0,
                    low_stock_threshold: 10, // default
                } as InventoryBalance;
            });

            setAllBalances(enrichedBalances);
            setAllMaterials(materialsData);
            
            if (enrichedBalances.length > 0 && !selectedMaterialId) {
                setSelectedMaterialId(enrichedBalances[0].material_id);
            }
        } catch (error) {
            toast({ title: "Erro!", description: "Não foi possível carregar o estoque.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, [selectedMaterialId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    useEffect(() => {
        const fetchMovements = async () => {
            if (!selectedMaterialId) {
                setMovements([]);
                return;
            }
            setIsLoadingMovements(true);
            try {
                const movementsData = await supabaseService.getInventoryMovements(selectedMaterialId);
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
        if (searchQuery === '') return allBalances;
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
            // FIX: Added created_at timestamp to match the expected type for insertion.
            const fullMovementData = { ...movementData, created_at: new Date().toISOString() };
            await supabaseService.addDocument('inventory_movements', fullMovementData);
            toast({ title: "Sucesso!", description: "Movimento de estoque registrado." });
            loadData(); // Trigger a full data refresh
        } catch (error) {
            toast({ title: "Erro!", description: "Não foi possível registrar o movimento.", variant: "destructive" });
        }
    };
    
     useEffect(() => {
        if(selectedMaterialId && filteredBalances.length > 0 && !filteredBalances.find(b => b.material_id === selectedMaterialId)) {
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