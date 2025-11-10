import React, { useState } from 'react';
import { ShoppingBasket, Loader2 } from 'lucide-react';
import { usePurchasing } from '../hooks/usePurchasing';
import PurchasesTabs from '../components/purchases/PurchasesTabs';
import SupplierDialog from '../components/purchases/SupplierDialog';
import { Supplier, PurchaseOrder } from '../types';
import CreatePODialog from '../components/purchases/CreatePODialog';
import ReceivePODialog from '../components/purchases/ReceivePODialog';

const PurchasesPage: React.FC = () => {
    const {
        isLoading,
        isSaving,
        isLoadingItems,
        isAdmin,
        activeTab,
        setActiveTab,
        allSuppliers,
        allMaterials,
        posWithDetails,
        selectedPO,
        setSelectedPOId,
        saveSupplier,
        createPO,
        receivePOItems,
    } = usePurchasing();
    
    const [isSupplierDialogOpen, setIsSupplierDialogOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
    const [isPODialogOpen, setIsPODialogOpen] = useState(false);
    const [isReceiveDialogOpen, setIsReceiveDialogOpen] = useState(false);

    const openSupplierDialog = (supplier: Supplier | null = null) => {
        setEditingSupplier(supplier);
        setIsSupplierDialogOpen(true);
    };

    const handleSaveSupplier = async (data: any) => {
        await saveSupplier(data);
        setIsSupplierDialogOpen(false);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div>
            <PurchasesTabs
                activeTab={activeTab}
                onTabChange={setActiveTab}
                suppliers={allSuppliers}
                purchaseOrders={posWithDetails}
                onNewSupplierClick={() => openSupplierDialog()}
                onEditSupplierClick={openSupplierDialog}
                onNewPOClick={() => setIsPODialogOpen(true)}
                onReceivePOClick={() => setIsReceiveDialogOpen(true)}
                selectedPO={selectedPO}
                onSelectPO={setSelectedPOId}
                isSaving={isSaving}
                isLoadingItems={isLoadingItems}
            />

            <SupplierDialog
                isOpen={isSupplierDialogOpen}
                onClose={() => setIsSupplierDialogOpen(false)}
                onSave={handleSaveSupplier}
                supplier={editingSupplier}
            />
            
            <CreatePODialog
                isOpen={isPODialogOpen}
                onClose={() => setIsPODialogOpen(false)}
                onSave={createPO}
                suppliers={allSuppliers}
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
};

export default PurchasesPage;