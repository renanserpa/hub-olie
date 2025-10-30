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
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                <div>
                    <div className="flex items-center gap-3">
                        <ShoppingBasket className="text-primary" size={28} />
                        <h1 className="text-3xl font-bold text-textPrimary">Compras</h1>
                    </div>
                    <p className="text-textSecondary mt-1">Gerencie fornecedores e pedidos de compra de materiais.</p>
                </div>
            </div>
            
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