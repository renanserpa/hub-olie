import React from 'react';
import { useMaterials } from "../../../hooks/useMaterials";
import { MaterialPreviewCard } from "./MaterialPreviewCard";
import { Loader2, Wrench } from 'lucide-react';
import PlaceholderContent from '../../PlaceholderContent';

export function MaterialList() {
  const { materials, loading } = useMaterials();

  if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  if (materials.length === 0) {
      return <PlaceholderContent title="Nenhum Material Cadastrado" requiredTable="config_materials" icon={Wrench}>
          <p className="mt-1 text-sm text-textSecondary">Comece cadastrando um novo material para gerenciar seu inventário.</p>
      </PlaceholderContent>
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {materials.map((m) => (
          <MaterialPreviewCard key={m.id} material={m} />
        ))}
    </div>
  );
}