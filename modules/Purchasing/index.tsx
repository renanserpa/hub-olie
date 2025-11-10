// modules/Purchasing/index.tsx
import React from 'react';
import PurchasePanel from './PurchasePanel';
import { usePurchasing } from './hooks/usePurchasing';
import { Loader2 } from 'lucide-react';
import CreatePODialog from '../../components/purchases/CreatePODialog';
import ReceivePODialog from '../../components/purchases/ReceivePODialog';

export default function Purchasing() {
  const {
    isLoading,
    isSaving,
    activeTab,
    setActiveTab,
    // Suppliers
    suppliers,
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
    </div>
  );
}