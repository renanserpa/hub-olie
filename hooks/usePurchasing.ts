import { useState, useEffect, useMemo, useCallback } from 'react';
import { Supplier, PurchaseOrder, PurchaseOrderItem, Material } from '../types';
import { dataService } from '../services/dataService';
import { toast } from './use-toast';
import { useAuth } from '../context/AuthContext';

export function usePurchasing() {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('suppliers');
    
    // Data states
    const [allSuppliers, setAllSuppliers] = useState<Supplier[]>([]);
    const [allPOs, setAllPOs] = useState<PurchaseOrder[]>([]);
    const [allPOItems, setAllPOItems] = useState<PurchaseOrderItem[]>([]);
    const [allMaterials, setAllMaterials] = useState<Material[]>([]);

    const [selectedPOId, setSelectedPOId] = useState<string | null>(null);

    const isAdmin = user?.role === 'AdminGeral' || user?.role === 'Financeiro';

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            console.log("[PURCHASING] Loading tables...");
            const { suppliers, purchase_orders, purchase_order_items } = await dataService.getPurchasingData();
            const materials = await dataService.getCollection<Material>('config_materials');

            const loadedTables: string[] = [];
            const missingTables: string[] = [];

            if(suppliers) { setAllSuppliers(suppliers); loadedTables.push('suppliers'); } else { missingTables.push('suppliers'); }
            if(purchase_orders) { setAllPOs(purchase_orders); loadedTables.push('purchase_orders'); } else { missingTables.push('purchase_orders'); }
            if(purchase_order_items) { setAllPOItems(purchase_order_items); loadedTables.push('purchase_order_items'); } else { missingTables.push('purchase_order_items'); }
            
            setAllMaterials(materials);

            console.log(`[PURCHASING] Loaded tables: ${loadedTables.join(', ')}`);
            if (missingTables.length > 0) {
                 console.warn(`[PURCHASING] Missing tables: ${missingTables.join(', ')}`);
            }
        } catch (error) {
            toast({ title: "Erro!", description: "Não foi possível carregar os dados de compras.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const posWithDetails = useMemo(() => {
        return allPOs.map(po => {
            const supplier = allSuppliers.find(s => s.id === po.supplier_id);
            const items = allPOItems.filter(item => item.po_id === po.id);
            return { ...po, supplier, items };
        });
    }, [allPOs, allSuppliers, allPOItems]);

    const selectedPO = useMemo(() => {
        return posWithDetails.find(po => po.id === selectedPOId) || null;
    }, [posWithDetails, selectedPOId]);


    // --- MUTATIONS ---
    const saveSupplier = async (supplierData: Omit<Supplier, 'id' | 'created_at' | 'updated_at'> | Supplier) => {
        try {
            if ('id' in supplierData) {
                await dataService.updateDocument('suppliers', supplierData.id, supplierData);
                toast({ title: "Sucesso!", description: "Fornecedor atualizado." });
            } else {
                await dataService.addDocument('suppliers', supplierData as Omit<Supplier, 'id'>);
                toast({ title: "Sucesso!", description: "Novo fornecedor criado." });
            }
            loadData();
        } catch (error) {
            toast({ title: "Erro!", description: "Não foi possível salvar o fornecedor.", variant: "destructive" });
            throw error;
        }
    };
    
    return {
        isLoading,
        isAdmin,
        activeTab,
        setActiveTab,
        
        // Data for UI
        allSuppliers,
        posWithDetails,
        allMaterials,
        selectedPO,
        setSelectedPOId,

        // Actions
        saveSupplier,
    };
}