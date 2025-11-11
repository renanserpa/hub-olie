import React from 'react';
import { Supplier } from '../../types';
import { Button } from '../ui/Button';
import { Edit, Star } from 'lucide-react';
import { Badge } from '../ui/Badge';

interface SuppliersTableProps {
    suppliers: Supplier[];
    onEdit: (supplier: Supplier) => void;
    canWrite: boolean;
}

const SuppliersTable: React.FC<SuppliersTableProps> = ({ suppliers, onEdit, canWrite }) => {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-secondary">
                    <tr>
                        <th className="p-4 font-semibold text-textSecondary">Nome</th>
                        <th className="p-4 font-semibold text-textSecondary">Contato</th>
                        <th className="p-4 font-semibold text-textSecondary">Lead Time</th>
                        <th className="p-4 font-semibold text-textSecondary">Rating</th>
                        <th className="p-4 font-semibold text-textSecondary">Status</th>
                        {canWrite && <th className="p-4 font-semibold text-textSecondary text-right">Ações</th>}
                    </tr>
                </thead>
                <tbody>
                    {suppliers.map(supplier => (
                        <tr key={supplier.id} className="border-b border-border hover:bg-accent/50">
                            <td className="p-4 font-medium text-textPrimary">{supplier.name}</td>
                            <td className="p-4">
                                <span className="block">{supplier.email}</span>
                                <span className="block text-xs text-textSecondary">{supplier.phone}</span>
                            </td>
                            <td className="p-4">{supplier.lead_time_days} dias</td>
                            <td className="p-4">
                                {supplier.rating && (
                                    <span className="flex items-center gap-1">
                                        {supplier.rating} <Star size={14} className="text-yellow-500 fill-current" />
                                    </span>
                                )}
                            </td>
                            <td className="p-4">
                                <Badge variant={supplier.is_active ? 'ativo' : 'inativo'}>
                                    {supplier.is_active ? 'Ativo' : 'Inativo'}
                                </Badge>
                            </td>
                            {canWrite && (
                                <td className="p-4 text-right">
                                    <Button variant="ghost" size="sm" onClick={() => onEdit(supplier)}>
                                        <Edit size={14} className="mr-2" />
                                        Editar
                                    </Button>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default SuppliersTable;
