// modules/Purchasing/settings/SupplyGroupsManagement.tsx
import React, { useState } from 'react';
import { useSupplyGroups } from '../hooks/useSupplyGroups';
import { Loader2, Box, Edit } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import PlaceholderContent from '../../../components/PlaceholderContent';
import { Button } from '../../../components/ui/Button';
import { Plus } from 'lucide-react';
import Modal from '../../../components/ui/Modal';
import { MaterialGroup } from '../../../types';

const GroupDialog: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => Promise<void>;
    isSaving: boolean;
    group: Partial<MaterialGroup> | null;
}> = ({ isOpen, onClose, onSave, isSaving, group }) => {
    const [form, setForm] = useState({ name: "", description: "" });

    React.useEffect(() => {
        if (group) setForm({ name: group.name || "", description: group.description || "" });
        else setForm({ name: "", description: "" });
    }, [group, isOpen]);
    
    const handleSave = async () => {
        await onSave(group ? { ...group, ...form } : { ...form, is_active: true });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={group ? "Editar Grupo" : "Novo Grupo"}>
            <div className="space-y-4">
                <input type="text" placeholder="Nome do grupo" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full p-2 border rounded-md" required />
                <textarea placeholder="Descrição" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full p-2 border rounded-md" rows={3}/>
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={onClose}>Cancelar</Button>
                    <Button onClick={handleSave} disabled={isSaving}>{isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin"/>} Salvar</Button>
                </div>
            </div>
        </Modal>
    );
};

export default function SupplyGroupsManagement() {
    const { groups, isLoading, canWrite, saveGroup, isSaving } = useSupplyGroups();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingGroup, setEditingGroup] = useState<MaterialGroup | null>(null);

    const openDialog = (group: MaterialGroup | null = null) => {
        setEditingGroup(group);
        setIsDialogOpen(true);
    };

    const handleSave = async (data: any) => {
        await saveGroup(data);
        setIsDialogOpen(false);
    };
    
    if (isLoading) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
    }

    if (!groups) {
        return <PlaceholderContent title="Grupos de Suprimento" requiredTable="config_supply_groups" icon={Box} />;
    }

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Grupos de Suprimento</CardTitle>
                    {canWrite && <Button onClick={() => openDialog()}><Plus className="w-4 h-4 mr-2" />Novo Grupo</Button>}
                </CardHeader>
                <CardContent>
                     <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-secondary">
                                <tr>
                                    <th className="p-4">Nome</th>
                                    <th className="p-4">Descrição</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                            {groups.map((g) => (
                                <tr key={g.id} className="border-b">
                                    <td className="p-4 font-medium">{g.name}</td>
                                    <td className="p-4 text-textSecondary">{g.description}</td>
                                    <td className="p-4"><Badge variant={g.is_active ? 'ativo' : 'inativo'}>{g.is_active ? 'Ativo' : 'Inativo'}</Badge></td>
                                    <td className="p-4 text-right">
                                        {canWrite && <Button variant="ghost" size="sm" onClick={() => openDialog(g)}><Edit size={14} className="mr-2" /> Editar</Button>}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
             <GroupDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                onSave={handleSave}
                group={editingGroup}
                isSaving={isSaving}
            />
        </>
    );
}