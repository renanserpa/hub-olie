import React from 'react';
import { useMaterials } from "../../../hooks/useMaterials";
import { Loader2, Box } from 'lucide-react';
import { Card, CardContent } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import PlaceholderContent from '../../PlaceholderContent';

export function MaterialGroupList() {
  const { groups, loading } = useMaterials();

  if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  
  if (groups.length === 0) {
      return <PlaceholderContent title="Nenhum Grupo de Suprimento" requiredTable="config_supply_groups" icon={Box}>
          <p className="mt-1 text-sm text-textSecondary">Crie grupos como "Tecidos" ou "Metais" para organizar seus materiais.</p>
      </PlaceholderContent>
  }

  return (
    <Card>
      <CardContent className="p-0">
         <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-secondary">
                    <tr>
                        <th className="p-4 font-semibold text-textSecondary">Nome</th>
                        <th className="p-4 font-semibold text-textSecondary">Descrição</th>
                        <th className="p-4 font-semibold text-textSecondary">Status</th>
                    </tr>
                </thead>
                <tbody>
                {groups.map((g) => (
                    <tr key={g.id} className="border-b border-border">
                        <td className="p-4 font-medium text-textPrimary">{g.name}</td>
                        <td className="p-4 text-textSecondary">{g.description}</td>
                        <td className="p-4">
                            <Badge variant={g.is_active ? 'ativo' : 'inativo'}>
                                {g.is_active ? 'Ativo' : 'Inativo'}
                            </Badge>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
      </CardContent>
    </Card>
  );
}