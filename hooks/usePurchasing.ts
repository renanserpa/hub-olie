import { useState, useEffect, useMemo, useCallback } from 'react';
import { Supplier, PurchaseOrder, PurchaseOrderItem, Material } from '../types';
import { dataService } from '../services/dataService';
import { toast } from './use-toast';
import { useAuth } from '../context/AuthContext';

export function usePurchasing() {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('suppliers');
    
    // Data states
    const [allSuppliers, setAllSuppliers] = useState<Supplier[]>([]);
    const [allPOs, setAllPOs] = useState<PurchaseOrder[]>([]);
    const [allMaterials, setAllMaterials] = useState<Material[]>([]);

    const [selectedPOId, setSelectedPOId] = useState<string | null>(null);

    const isAdmin = user?.role === 'AdminGeral' || user?.role === 'Financeiro';

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            console.log("[PURCHASING] Loading tables...");
            const { suppliers, purchase_orders } = await dataService.getPurchasingData();
            const [materials, poItems] = await Promise.all([
                dataService.getCollection<Material>('config_materials'),
                dataService.getCollection<PurchaseOrderItem>('purchase_order_items')
            ]);

            const loadedTables: string[] = [];
            const missingTables: string[] = [];
            
            setAllMaterials(materials);

            if(suppliers) { setAllSuppliers(suppliers); loadedTables.push('suppliers'); } else { missingTables.push('suppliers'); }
            if(purchase_orders) { 
                const posWithItems = purchase_orders.map(po => ({
                    ...po,
                    items: poItems.filter(item => item.po_id === po.id)
                }));
                setAllPOs(posWithItems); 
                loadedTables.push('purchase_orders'); 
            } else { 
                missingTables.push('purchase_orders'); 
            }
            
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

        const handleDataChange = () => {
            console.log('Realtime update detected in purchasing module, refreshing...');
            loadData();
        };

        const suppliersListener = dataService.listenToCollection('suppliers', undefined, handleDataChange);
        const poListener = dataService.listenToCollection('purchase_orders', undefined, handleDataChange);
        const poItemsListener = dataService.listenToCollection('purchase_order_items', undefined, handleDataChange);

        return () => {
            suppliersListener.unsubscribe();
            poListener.unsubscribe();
            poItemsListener.unsubscribe();
        };
    }, [loadData]);

    const posWithDetails = useMemo(() => {
        return allPOs.map(po => ({
            ...po,
            supplier: allSuppliers.find(s => s.id === po.supplier_id)
        }));
    }, [allPOs, allSuppliers]);

    const selectedPO = useMemo(() => {
        return posWithDetails.find(po => po.id === selectedPOId) || null;
    }, [posWithDetails, selectedPOId]);


    // --- MUTATIONS ---
    const saveSupplier = async (supplierData: Omit<Supplier, 'id' | 'created_at' | 'updated_at'> | Supplier) => {
        setIsSaving(true);
        try {
            if ('id' in supplierData) {
                await dataService.updateDocument('suppliers', supplierData.id, supplierData);
                toast({ title: "Sucesso!", description: "Fornecedor atualizado." });
            } else {
                await dataService.addDocument('suppliers', supplierData as Omit<Supplier, 'id'>);
                toast({ title: "Sucesso!", description: "Novo fornecedor criado." });
            }
            // Realtime listener will handle refresh
        } catch (error) {
            toast({ title: "Erro!", description: "Não foi possível salvar o fornecedor.", variant: "destructive" });
            throw error;
        } finally {
            setIsSaving(false);
        }
    };
    
    const createPO = async (poData: { supplier_id: string, items: Omit<PurchaseOrderItem, 'id' | 'po_id'>[] }) => {
        setIsSaving(true);
        try {
            await dataService.createPO(poData);
            toast({ title: "Sucesso!", description: "Novo Pedido de Compra criado." });
            // Realtime listener will handle refresh
        } catch (error) {
            toast({ title: "Erro!", description: "Não foi possível criar o Pedido de Compra.", variant: "destructive" });
            throw error;
        } finally {
            setIsSaving(false);
        }
    };

    const receivePOItems = async (poId: string, receivedItems: { itemId: string; receivedQty: number }[]) => {
        setIsSaving(true);
        try {
            await dataService.receivePOItems(poId, receivedItems);
            toast({ title: "Sucesso!", description: "Recebimento de materiais registrado." });
            // Realtime listener will handle refresh
        } catch (error) {
            toast({ title: "Erro!", description: "Não foi possível registrar o recebimento.", variant: "destructive" });
            throw error;
        } finally {
            setIsSaving(false);
        }
    };
    
    return {
        isLoading,
        isSaving,
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
        createPO,
        receivePOItems,
    };
}