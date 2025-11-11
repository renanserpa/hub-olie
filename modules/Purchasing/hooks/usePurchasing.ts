// modules/Purchasing/hooks/usePurchasing.ts
import { useState, useEffect } from 'react';
import { useSuppliers } from './useSuppliers';
import { useSupplyGroups } from './useSupplyGroups';
import { usePurchaseOrders } from './usePurchaseOrders';
import { dataService } from '../../../services/dataService';
import { Material, Supplier } from '../../../types';

export function usePurchasing() {
  const [activeTab, setActiveTab] = useState<'pos' | 'settings' | 'metrics'>('pos');
  const [allMaterials, setAllMaterials] = useState<Material[]>([]);
  const [isLoadingMaterials, setIsLoadingMaterials] = useState(true);

  // Dialog states for POs
  const [isPODialogOpen, setIsPODialogOpen] = useState(false);
  const [isReceiveDialogOpen, setIsReceiveDialogOpen] = useState(false);
  
  // Dialog states for Suppliers
  const [isSupplierDialogOpen, setIsSupplierDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);


  // Sub-hooks for each data entity
  const suppliersHook = useSuppliers();
  const supplyGroupsHook = useSupplyGroups();
  const purchaseOrdersHook = usePurchaseOrders();

  useEffect(() => {
    async function fetchMaterials() {
        setIsLoadingMaterials(true);
        const materials = await dataService.getCollection<Material>('config_materials');
        setAllMaterials(materials);
        setIsLoadingMaterials(false);
    }
    fetchMaterials();
  }, []);

  const isLoading = suppliersHook.isLoading || supplyGroupsHook.isLoading || purchaseOrdersHook.isLoading || isLoadingMaterials;
  const isSaving = suppliersHook.isSaving || supplyGroupsHook.isSaving || purchaseOrdersHook.isSaving;

  return {
    isLoading,
    isSaving,
    activeTab,
    setActiveTab,

    // From useSuppliers
    suppliers: suppliersHook.suppliers,
    saveSupplier: suppliersHook.saveSupplier,
    isSupplierDialogOpen,
    setIsSupplierDialogOpen,
    editingSupplier,
    setEditingSupplier,

    // From useSupplyGroups
    supplyGroups: supplyGroupsHook.groups,

    // From usePurchaseOrders
    purchaseOrders: purchaseOrdersHook.purchaseOrders,
    selectedPO: purchaseOrdersHook.selectedPO,
    setSelectedPOId: purchaseOrdersHook.setSelectedPOId,
    isLoadingItems: purchaseOrdersHook.isLoadingItems,
    createPO: purchaseOrdersHook.createPO,
    receivePOItems: purchaseOrdersHook.receivePOItems,
    
    // Aux data
    allMaterials,

    // Dialogs for POs
    isPODialogOpen,
    setIsPODialogOpen,
    isReceiveDialogOpen,
    setIsReceiveDialogOpen,
  };
}