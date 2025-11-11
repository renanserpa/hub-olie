import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Shield, Loader2, Save } from 'lucide-react';
import { Button } from '../ui/Button';
import { dataService } from '../../services/dataService';
import { SystemRole, SystemPermission, UserRole } from '../../types';
import { DefaultRBAC } from '../../lib/rbac';
import { toast } from '../../hooks/use-toast';
import { cn } from '../../lib/utils';

const modules = Object.keys(DefaultRBAC.Administrativo || {});

const RBACMatrixPanel: React.FC = () => {
    const [roles, setRoles] = useState<SystemRole[]>([]);
    const [permissions, setPermissions] = useState<SystemPermission[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const [rolesData, permsData] = await Promise.all([
                    dataService.getRoles(),
                    dataService.getPermissions(),
                ]);
                setRoles(rolesData);
                
                // Ensure every role/module combination has a permission entry
                const fullPerms: SystemPermission[] = [];
                rolesData.forEach(role => {
                    modules.forEach(module => {
                        const existing = permsData.find(p => p.role === role.name && p.scope === module);
                        if (existing) {
                            fullPerms.push(existing);
                        } else {
                            fullPerms.push({ id: `${role.name}-${module}`, role: role.name as UserRole, scope: module, read: false, write: false, update: false, delete: false });
                        }
                    });
                });
                setPermissions(fullPerms);

            } catch (e) {
                toast({ title: 'Erro', description: 'Não foi possível carregar as permissões.', variant: 'destructive' });
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    const handlePermissionChange = (role: string, scope: string, perm: 'read' | 'write' | 'update' | 'delete', value: boolean) => {
        setPermissions(prev =>
            prev.map(p => 
                (p.role === role && p.scope === scope) ? { ...p, [perm]: value } : p
            )
        );
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await dataService.updatePermissions(permissions);
            toast({ title: 'Sucesso!', description: 'Matriz de permissões salva.' });
        } catch(e) {
            toast({ title: 'Erro!', description: 'Não foi possível salvar as permissões.', variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    };
    
    if (isLoading) {
        return (
            <Card>
                <CardHeader><CardTitle>Matriz de Acesso (RBAC)</CardTitle></CardHeader>
                <CardContent className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="flex-row items-center justify-between">
                <CardTitle>Matriz de Acesso (RBAC)</CardTitle>
                <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Salvar Permissões
                </Button>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full text-xs border-collapse">
                        <thead>
                            <tr className="bg-secondary">
                                <th className="p-2 border font-semibold">Função \ Módulo</th>
                                {modules.map(mod => (
                                    <th key={mod} colSpan={4} className="p-2 border font-semibold text-center">{mod}</th>
                                ))}
                            </tr>
                             <tr className="bg-secondary/50">
                                <th className="p-1 border"></th>
                                {modules.map(mod => (
                                    <React.Fragment key={mod}>
                                        <th className="p-1 border text-center font-medium">L</th>
                                        <th className="p-1 border text-center font-medium">E</th>
                                        <th className="p-1 border text-center font-medium">A</th>
                                        <th className="p-1 border text-center font-medium">D</th>
                                    </React.Fragment>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {roles.map(role => (
                                <tr key={role.id}>
                                    <td className="p-2 border font-semibold">{role.name}</td>
                                    {modules.map(mod => {
                                        const p = permissions.find(perm => perm.role === role.name && perm.scope === mod);
                                        return (
                                            <React.Fragment key={mod}>
                                                <td className="p-1 border text-center"><input type="checkbox" checked={!!p?.read} onChange={(e) => handlePermissionChange(role.name, mod, 'read', e.target.checked)} /></td>
                                                <td className="p-1 border text-center"><input type="checkbox" checked={!!p?.write} onChange={(e) => handlePermissionChange(role.name, mod, 'write', e.target.checked)} /></td>
                                                <td className="p-1 border text-center"><input type="checkbox" checked={!!p?.update} onChange={(e) => handlePermissionChange(role.name, mod, 'update', e.target.checked)} /></td>
                                                <td className="p-1 border text-center"><input type="checkbox" checked={!!p?.delete} onChange={(e) => handlePermissionChange(role.name, mod, 'delete', e.target.checked)} /></td>
                                            </React.Fragment>
                                        )
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
};

export default RBACMatrixPanel;