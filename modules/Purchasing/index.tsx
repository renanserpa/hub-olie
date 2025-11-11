// modules/Purchasing/index.tsx
import React from 'react';
import PurchasePanel from './PurchasePanel';
import { usePurchasing } from './hooks/usePurchasing';
import { Loader2 } from 'lucide-react';
import CreatePODialog from '../../components/purchases/CreatePODialog';
import ReceivePODialog from '../../components/purchases/ReceivePODialog';
import SupplierDialog from '../../components/purchases/SupplierDialog';
import { Supplier } from '../../types';

export default function Purchasing() {
  const {
    isLoading,
    isSaving,
    activeTab,
    setActiveTab,
    // Suppliers
    suppliers,
    saveSupplier,
    isSupplierDialogOpen,
    setIsSupplierDialogOpen,
    editingSupplier,
    setEditingSupplier,
    // Supply Groups
    supplyGroups,
    // Purchase Orders
    purchaseOrders,
    selectedPO,
    setSelectedPOId,
    isLoadingItems,
    createPO,
    receivePOItems,
    // Materials for Dialogs
    allMaterials,
    // Dialog states
    isPODialogOpen,
    setIsPODialogOpen,
    isReceiveDialogOpen,
    setIsReceiveDialogOpen,
  } = usePurchasing();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleSaveSupplier = async (data: any) => {
    await saveSupplier(data);
    setIsSupplierDialogOpen(false);
  };

  return (
    <div>
      <PurchasePanel
        activeTab={activeTab}
        onTabChange={setActiveTab}
        suppliers={suppliers}
        supplyGroups={supplyGroups}
        purchaseOrders={purchaseOrders}
        onNewPOClick={() => setIsPODialogOpen(true)}
        onReceivePOClick={() => selectedPO && setIsReceiveDialogOpen(true)}
        selectedPO={selectedPO}
        onSelectPO={setSelectedPOId}
        isSaving={isSaving}
        isLoadingItems={isLoadingItems}
        onNewSupplierClick={() => { setEditingSupplier(null); setIsSupplierDialogOpen(true); }}
        onEditSupplierClick={(supplier) => { setEditingSupplier(supplier); setIsSupplierDialogOpen(true); }}
      />

      <CreatePODialog
        isOpen={isPODialogOpen}
        onClose={() => setIsPODialogOpen(false)}
        onSave={createPO}
        suppliers={suppliers}
        materials={allMaterials}
        isSaving={isSaving}
      />

      {selectedPO && (
        <ReceivePODialog
          isOpen={isReceiveDialogOpen}
          onClose={() => setIsReceiveDialogOpen(false)}
          onSave={receivePOItems}
          purchaseOrder={selectedPO}
          isSaving={isSaving}
        />
      )}
      
      <SupplierDialog
        isOpen={isSupplierDialogOpen}
        onClose={() => setIsSupplierDialogOpen(false)}
        onSave={handleSaveSupplier}
        // FIX: The type of editingSupplier is 'Supplier | null', which is correct. No change needed here.
        supplier={editingSupplier as Supplier}
        // FIX: Pass the isSaving prop to the SupplierDialog component.
        isSaving={isSaving}
      />
    </div>
  );
}
