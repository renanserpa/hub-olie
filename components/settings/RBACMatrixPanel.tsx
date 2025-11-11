import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Shield, Loader2, Save } from 'lucide-react';
import { Button } from '../ui/Button';
import { dataService } from '../../services/dataService';
import { SystemRole, SystemPermission, UserRole } from '../../types';
import { toast } from '../../hooks/use-toast';

const modules = [ "Dashboard", "Initializer", "ExecutiveDashboard", "Analytics", "Orders", "Production", "Inventory", "Purchases", "Logistics", "Finance", "Omnichannel", "Marketing", "Contacts", "Products", "Settings" ];
const permissionsTypes: Array<'read' | 'write' | 'update' | 'delete'> = ['read', 'write', 'update', 'delete'];

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
                
                const filteredRoles = rolesData.filter(r => r.name !== 'AdminGeral');
                setRoles(filteredRoles);
                
                const fullPerms: SystemPermission[] = [];
                filteredRoles.forEach(role => {
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
                <CardHeader><CardTitle className="flex items-center gap-2"><Shield size={20}/>Matriz de Acesso (RBAC)</CardTitle></CardHeader>
                <CardContent className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2"><Shield size={20}/>Matriz de Acesso (RBAC)</CardTitle>
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
                                <th className="p-2 border font-semibold sticky left-0 bg-secondary z-10">Função \ Módulo</th>
                                {modules.map(mod => (
                                    <th key={mod} colSpan={4} className="p-2 border font-semibold text-center">{mod}</th>
                                ))}
                            </tr>
                             <tr className="bg-secondary/50">
                                <th className="p-1 border sticky left-0 bg-secondary/50 z-10"></th>
                                {modules.map(mod => (
                                    <React.Fragment key={mod}>
                                        <th className="p-1 border text-center font-medium" title="Leitura">L</th>
                                        <th className="p-1 border text-center font-medium" title="Escrita">E</th>
                                        <th className="p-1 border text-center font-medium" title="Atualização">A</th>
                                        <th className="p-1 border text-center font-medium" title="Deleção">D</th>
                                    </React.Fragment>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {roles.map(role => (
                                <tr key={role.id}>
                                    <td className="p-2 border font-semibold sticky left-0 bg-card z-10">{role.name}</td>
                                    {modules.map(mod => {
                                        const p = permissions.find(perm => perm.role === role.name && perm.scope === mod);
                                        return (
                                            <React.Fragment key={mod}>
                                                {permissionsTypes.map(permType => (
                                                    <td key={permType} className="p-1 border text-center">
                                                        <input 
                                                            type="checkbox" 
                                                            checked={!!p?.[permType]} 
                                                            onChange={(e) => handlePermissionChange(role.name, mod, permType, e.target.checked)}
                                                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                                        />
                                                    </td>
                                                ))}
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
