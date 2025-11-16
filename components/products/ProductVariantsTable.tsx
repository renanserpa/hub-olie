import React from 'react';
import { ProductVariant } from '../../types';
import { Badge } from '../ui/Badge';
import { GitBranch } from 'lucide-react';

interface ProductVariantsTableProps {
    variants: ProductVariant[];
}

const ProductVariantsTable: React.FC<ProductVariantsTableProps> = ({ variants }) => {
    
    if (variants.length === 0) {
        return (
            <div className="text-center text-textSecondary py-12 border-2 border-dashed border-border rounded-xl">
                <GitBranch className="mx-auto h-10 w-10 text-gray-400" />
                <h3 className="mt-3 text-md font-medium text-textPrimary">Nenhuma Variante Gerada</h3>
                <p className="mt-1 text-xs">Use o botão &quot;Gerar Variantes Válidas&quot; para criar os SKUs para este produto.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-secondary">
                    <tr>
                        <th className="p-4 font-semibold text-textSecondary">SKU</th>
                        <th className="p-4 font-semibold text-textSecondary">Nome da Variante</th>
                        <th className="p-4 font-semibold text-textSecondary">Configuração</th>
                        <th className="p-4 font-semibold text-textSecondary text-right">Preço Final</th>
                    </tr>
                </thead>
                <tbody>
                    {variants.map(variant => (
                        <tr key={variant.id} className="border-b border-border hover:bg-accent/50">
                            <td className="p-4 font-medium text-textPrimary font-mono">{variant.sku}</td>
                            <td className="p-4">{variant.name}</td>
                            <td className="p-4">
                                <div className="flex flex-wrap gap-1">
                                    {Object.entries(variant.configuration).map(([key, value]) => (
                                        <Badge key={key} variant="secondary" className="text-xs">
                                            {key.replace(/_/g, ' ')}: {value}
                                        </Badge>
                                    ))}
                                </div>
                            </td>
                            <td className="p-4 text-right font-semibold">
                                {variant.final_price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ProductVariantsTable;