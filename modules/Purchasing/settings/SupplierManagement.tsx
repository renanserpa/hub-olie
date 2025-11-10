// modules/Purchasing/settings/SupplierManagement.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Plus, Loader2 } from 'lucide-react';
import { useSuppliers } from '../../../hooks/useSuppliers';
import SuppliersTable from '../../../components/purchases/SuppliersTable';
import SupplierDialog from '../../../components/purchases/SupplierDialog';
import { Supplier } from '../../../types';
import PlaceholderContent from '../../../components/PlaceholderContent';
import { Users } from 'lucide-react';

export default function SupplierManagement() {
    const { suppliers, isLoading, canWrite, saveSupplier, isSaving } = useSuppliers();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

    const openDialog = (supplier: Supplier | null = null) => {
        setEditingSupplier(supplier);
        setIsDialogOpen(true);
    };

    const handleSave = async (data: any) => {
        await saveSupplier(data);
        setIsDialogOpen(false);
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
    }

    if (!suppliers) {
        return <PlaceholderContent title="Módulo de Fornecedores" requiredTable="suppliers" icon={Users} />;
    }

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Fornecedores Cadastrados</CardTitle>
                    {canWrite && <Button onClick={() => openDialog()}><Plus className="w-4 h-4 mr-2" />Novo Fornecedor</Button>}
                </CardHeader>
                <CardContent>
                    <SuppliersTable suppliers={suppliers} onEdit={openDialog} canWrite={canWrite}/>
                </CardContent>
            </Card>
            <SupplierDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                onSave={handleSave}
                supplier={editingSupplier}
                isSaving={isSaving}
            />
        </>
    );
}