// modules/Purchasing/hooks/usePurchaseOrders.ts
import { useState, useEffect, useMemo, useCallback } from 'react';
import { PurchaseOrder, PurchaseOrderItem, Supplier, Material } from '../../../types';
import { dataService } from '../../../services/dataService';
import { toast } from '../../../hooks/use-toast';
import { useOlie } from '../../../contexts/OlieContext';

export function usePurchaseOrders() {
    const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [selectedPOId, setSelectedPOId] = useState<string | null>(null);
    const [selectedPOItems, setSelectedPOItems] = useState<PurchaseOrderItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingItems, setIsLoadingItems] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const { can } = useOlie();

    const canWrite = can('Purchases', 'write');

    useEffect(() => {
        setIsLoading(true);
        const poListener = dataService.listenToCollection('purchase_orders', '*, supplier:suppliers(*)', (data) => {
            setPurchaseOrders(data as PurchaseOrder[]);
            setIsLoading(false);
        }, setPurchaseOrders);
        const supplierListener = dataService.listenToCollection('suppliers', undefined, (data) => setSuppliers(data as Supplier[]), setSuppliers);

        return () => {
            poListener.unsubscribe();
            supplierListener.unsubscribe();
        };
    }, []);
    
    useEffect(() => {
        if (!selectedPOId) {
            setSelectedPOItems([]);
            return;
        }
        const fetchItems = async () => {
            setIsLoadingItems(true);
            try {
                const items = await dataService.getPurchaseOrderItems(selectedPOId);
                setSelectedPOItems(items);
            } catch (error) {
                toast({ title: "Erro", description: "Não foi possível carregar os itens.", variant: "destructive" });
            } finally {
                setIsLoadingItems(false);
            }
        };
        fetchItems();
    }, [selectedPOId]);

    const selectedPO = useMemo(() => {
        const po = purchaseOrders.find(p => p.id === selectedPOId);
        if (!po) return null;
        return { ...po, items: selectedPOItems, supplier: suppliers.find(s => s.id === po.supplier_id) };
    }, [purchaseOrders, suppliers, selectedPOId, selectedPOItems]);

    const createPO = async (poData: { supplier_id: string; items: Omit<PurchaseOrderItem, 'id' | 'po_id' | 'material' | 'material_name' | 'received_quantity' | 'total'>[] }) => {
        if (!canWrite) throw new Error("Acesso negado");
        setIsSaving(true);
        try {
            const materials = await dataService.getCollection<Material>('config_materials');
            const materialMap = new Map(materials.map(m => [m.id, m.name]));

            const itemsWithDetails = poData.items.map(item => ({
                ...item,
                material_name: materialMap.get(item.material_id) || 'Desconhecido',
                total: item.quantity * item.unit_price,
                received_quantity: 0,
            }));

            await dataService.createPO({ supplier_id: poData.supplier_id, items: itemsWithDetails });
            toast({ title: "Sucesso!", description: "Pedido de Compra criado." });
        } catch (error) {
            toast({ title: "Erro!", description: (error as Error).message, variant: "destructive" });
            throw error;
        } finally {
            setIsSaving(false);
        }
    };

    const receivePOItems = async (poId: string, receivedItems: { itemId: string; receivedQty: number }[]) => {
        if (!canWrite) throw new Error("Acesso negado");
        setIsSaving(true);
        try {
            await dataService.receivePOItems(poId, receivedItems);
            toast({ title: "Sucesso!", description: "Recebimento de materiais registrado no estoque." });
        } catch (error) {
            toast({ title: "Erro!", description: (error as Error).message, variant: "destructive" });
            throw error;
        } finally {
            setIsSaving(false);
        }
    };

    return {
        purchaseOrders,
        selectedPO,
        setSelectedPOId,
        isLoading,
        isLoadingItems,
        isSaving,
        createPO,
        receivePOItems,
    };
}