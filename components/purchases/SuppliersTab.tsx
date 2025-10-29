import React from 'react';
import { Supplier } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Plus } from 'lucide-react';
import SuppliersTable from './SuppliersTable';
import EmptyState from './EmptyState';

interface SuppliersTabProps {
    suppliers: Supplier[];
    onNewClick: () => void;
    onEditClick: (supplier: Supplier) => void;
}

const SuppliersTab: React.FC<SuppliersTabProps> = ({ suppliers, onNewClick, onEditClick }) => {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Fornecedores Cadastrados</CardTitle>
                <Button onClick={onNewClick}>
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Fornecedor
                </Button>
            </CardHeader>
            <CardContent>
                {suppliers.length > 0 ? (
                    <SuppliersTable suppliers={suppliers} onEdit={onEditClick} />
                ) : (
                    <EmptyState
                        title="Nenhum Fornecedor"
                        message="Cadastre seu primeiro fornecedor para começar a criar pedidos de compra."
                    />
                )}
            </CardContent>
        </Card>
    );
};

export default SuppliersTab;