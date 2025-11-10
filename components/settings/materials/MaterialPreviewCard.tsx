import React from 'react';
import { Material } from "../../../types";

interface MaterialPreviewCardProps {
  material: Material;
}

export const MaterialPreviewCard: React.FC<MaterialPreviewCardProps> = ({ material }) => {
  return (
    <div className="border rounded-lg bg-card hover:shadow-lg transition-all group">
      <div className="aspect-square w-full bg-secondary rounded-t-lg overflow-hidden">
        <img
          src={material.url_public || `https://via.placeholder.com/300x300.png/F8F6F2/D2A66D?text=${material.name.charAt(0)}`}
          alt={material.name}
          className="rounded-t-md h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-3">
        <p className="font-semibold text-sm truncate">{material.name}</p>
        <p className="text-xs text-textSecondary">
          {material.config_supply_groups?.name || "Sem grupo"}
        </p>
      </div>
    </div>
  );
}
