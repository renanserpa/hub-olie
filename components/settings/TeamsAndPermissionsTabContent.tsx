import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Plus, Loader2, Edit } from 'lucide-react';
import { useUsers } from '../../hooks/useUsers';
import { Badge } from '../ui/Badge';
import { UserProfile } from '../../types';
import UserDialog from './UserDialog';

const TeamsAndPermissionsTabContent: React.FC = () => {
    const { users, isLoading, isAdmin, saveUser, deleteUser, isSaving } = useUsers();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

    const openDialog = (user: UserProfile | null = null) => {
        setEditingUser(user);
        setIsDialogOpen(true);
    };

    const handleSave = async (data: any) => {
        await saveUser(data);
        setIsDialogOpen(false);
    };
    
    const formatDate = (dateStr?: string) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('pt-BR');
    };

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Usuários e Permissões</CardTitle>
                    {isAdmin && (
                        <Button onClick={() => openDialog()}>
                            <Plus className="w-4 h-4 mr-2" />
                            Convidar Usuário
                        </Button>
                    )}
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center items-center h-48">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-secondary">
                                    <tr>
                                        <th className="p-4 font-semibold text-textSecondary">Usuário (Email)</th>
                                        <th className="p-4 font-semibold text-textSecondary">Função</th>
                                        <th className="p-4 font-semibold text-textSecondary">Data de Criação</th>
                                        {isAdmin && <th className="p-4 font-semibold text-textSecondary text-right">Ações</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(user => (
                                        <tr key={user.id} className="border-b border-border">
                                            <td className="p-4 font-medium text-textPrimary">{user.email}</td>
                                            <td className="p-4">
                                                <Badge variant="secondary">{user.role.replace('AdminGeral', 'Admin Geral')}</Badge>
                                            </td>
                                            <td className="p-4 text-textSecondary">{formatDate(user.created_at)}</td>
                                            {isAdmin && (
                                                <td className="p-4 text-right">
                                                    <Button variant="ghost" size="sm" onClick={() => openDialog(user)}>
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
                    )}
                </CardContent>
            </Card>

            <UserDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                onSave={handleSave}
                onDelete={deleteUser}
                user={editingUser}
                isSaving={isSaving}
            />
        </>
    );
};

export default TeamsAndPermissionsTabContent;