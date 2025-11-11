// modules/Purchasing/settings/SupplierManagement.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Plus, Loader2 } from 'lucide-react';
import { usePurchasing } from '../hooks/usePurchasing';
import SuppliersTable from '../../../components/purchases/SuppliersTable';
import { Supplier } from '../../../types';
import PlaceholderContent from '../../../components/PlaceholderContent';
import { Users } from 'lucide-react';

interface SupplierManagementProps {
    onNewClick: () => void;
    onEditClick: (supplier: Supplier) => void;
}

export default function SupplierManagement({ onNewClick, onEditClick }: SupplierManagementProps) {
    const { suppliers, isLoading } = usePurchasing();

    if (isLoading) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
    }

    if (!suppliers) {
        return <PlaceholderContent title="Módulo de Fornecedores" requiredTable="suppliers" icon={Users} />;
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Fornecedores Cadastrados</CardTitle>
                <Button onClick={onNewClick}><Plus className="w-4 h-4 mr-2" />Novo Fornecedor</Button>
            </CardHeader>
            <CardContent>
                <SuppliersTable suppliers={suppliers as any[]} onEdit={onEditClick} canWrite={true}/>
            </CardContent>
        </Card>
    );
}
