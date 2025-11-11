import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Shield, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';

const RBACMatrixPanel: React.FC = () => {
    // Mock data for display purposes
    const roles = ['AdminGeral', 'Administrativo', 'Producao', 'Vendas', 'Financeiro'];
    const modules = ['Orders', 'Production', 'Inventory', 'Finance', 'Products'];
    const permissions = ['read', 'write', 'update', 'delete'];

    return (
        <Card>
            <CardHeader className="flex-row items-center justify-between">
                <CardTitle>Matriz de Acesso (RBAC)</CardTitle>
                 <Button disabled>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Carregando Permissões...
                </Button>
            </CardHeader>
            <CardContent>
                <div className="text-center text-textSecondary py-16 border-2 border-dashed border-border rounded-xl">
                    <Shield className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium text-textPrimary">Painel de RBAC em Desenvolvimento</h3>
                    <p className="mt-1 text-sm text-textSecondary">Em breve, você poderá gerenciar as permissões de cada função para cada módulo diretamente por esta interface.</p>
                </div>
            </CardContent>
        </Card>
    );
};

export default RBACMatrixPanel;