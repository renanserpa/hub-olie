// modules/Purchasing/hooks/usePurchasing.ts
import { useState, useEffect } from 'react';
import { useSuppliers } from '../../../hooks/useSuppliers';
import { useSupplyGroups } from './useSupplyGroups';
import { usePurchaseOrders } from './usePurchaseOrders';
import { dataService } from '../../../services/dataService';
import { Material } from '../../../types';

export function usePurchasing() {
  const [activeTab, setActiveTab] = useState('pos');
  const [allMaterials, setAllMaterials] = useState<Material[]>([]);
  const [isLoadingMaterials, setIsLoadingMaterials] = useState(true);

  // Dialog states
  const [isPODialogOpen, setIsPODialogOpen] = useState(false);
  const [isReceiveDialogOpen, setIsReceiveDialogOpen] = useState(false);

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

  return {
    isLoading,
    isSaving: suppliersHook.isSaving || supplyGroupsHook.isSaving || purchaseOrdersHook.isSaving,
    activeTab,
    setActiveTab,

    // From useSuppliers
    suppliers: suppliersHook.suppliers,
    canWriteSuppliers: suppliersHook.canWrite,
    saveSupplier: suppliersHook.saveSupplier,
    deleteSupplier: suppliersHook.deleteSupplier,

    // From useSupplyGroups
    supplyGroups: supplyGroupsHook.groups,
    canWriteSupplyGroups: supplyGroupsHook.canWrite,
    saveSupplyGroup: supplyGroupsHook.saveGroup,
    deleteSupplyGroup: supplyGroupsHook.deleteGroup,

    // From usePurchaseOrders
    purchaseOrders: purchaseOrdersHook.purchaseOrders,
    selectedPO: purchaseOrdersHook.selectedPO,
    setSelectedPOId: purchaseOrdersHook.setSelectedPOId,
    isLoadingItems: purchaseOrdersHook.isLoadingItems,
    createPO: purchaseOrdersHook.createPO,
    receivePOItems: purchaseOrdersHook.receivePOItems,
    
    // Aux data
    allMaterials,

    // Dialogs
    isPODialogOpen,
    setIsPODialogOpen,
    isReceiveDialogOpen,
    setIsReceiveDialogOpen,
  };
}