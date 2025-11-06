import React from 'react';
// FIX: Add missing type imports
import { ProductionOrder, Material, BOMComponent, ProductionRoute, ProductionTaskStatus, ProductionQualityCheck } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { cn } from '../../lib/utils';

const DetailItem: React.FC<{ label: string; value?: string | number | null; className?: string }> = ({ label, value, className }) => (
    <div className={cn("py-2", className)}>
        <p className="text-xs text-textSecondary">{label}</p>
        <p className="font-medium text-sm text-textPrimary">{value || 'Não informado'}</p>
    </div>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="p-4">
        <h3 className="text-md font-semibold text-textPrimary border-b border-border pb-2 mb-3">{title}</h3>
        {children}
    </div>
);

interface ProductionOrderDetailPanelProps {
    order: ProductionOrder & { product?: any, tasks?: any[], variant?: any, route?: ProductionRoute };
    allMaterials: Material[];
    // FIX: Add missing props that are passed down from the parent drawer.
    onUpdateTaskStatus: (taskId: string, status: ProductionTaskStatus) => void;
    onCreateQualityCheck: (check: Omit<ProductionQualityCheck, 'id' | 'created_at'>) => void;
}

const ProductionOrderDetailPanel: React.FC<ProductionOrderDetailPanelProps> = ({ order, allMaterials }) => {
    
    const bomToShow: BOMComponent[] | undefined = order.variant?.bom && order.variant.bom.length > 0 
        ? order.variant.bom 
        : order.product?.base_bom;
        
    const bomTitle = order.variant?.bom && order.variant.bom.length > 0 
        ? "Materiais (BOM da Variante)" 
        : "Materiais (BOM Base)";

    return (
        <div className="space-y-2">
            <Section title="Resumo da Ordem de Produção">
                 <div className="grid grid-cols-3 gap-x-4">
                    <div>
                        <p className="text-xs text-textSecondary">Status</p>
                        <Badge variant="secondary" className="capitalize mt-1">{order.status.replace(/_/g, ' ')}</Badge>
                    </div>
                    <DetailItem label="Quantidade" value={order.quantity} />
                    <DetailItem label="Prioridade" value={order.priority} />
                    <DetailItem label="Prazo Final" value={new Date(order.due_date).toLocaleDateString('pt-BR')} />
                 </div>
            </Section>
            
            <Section title="Roteiro de Produção">
                <div className="space-y-2">
                    {order.route ? (
                        <ol className="relative border-l border-gray-200 dark:border-gray-700 ml-2">
                            {order.route.rota.map((step, index) => (
                                 <li key={index} className="mb-4 ml-4">
                                    <div className="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -left-1.5 border border-white dark:border-gray-900 dark:bg-gray-700"></div>
                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{step.replace('?', '')}</h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Tempo Padrão: {order.route.tempos_std_min[step]} min</p>
                                </li>
                            ))}
                        </ol>
                    ) : (
                        <p className="text-sm text-textSecondary">Nenhum roteiro de produção encontrado para este produto/tamanho.</p>
                    )}
                </div>
            </Section>

            <Section title={bomTitle}>
                <div className="space-y-2">
                     {bomToShow && bomToShow.length > 0 ? (
                         bomToShow.map((item: BOMComponent, index: number) => {
                            const material = allMaterials.find(m => m.id === item.material_id);
                            return (
                                <div key={index} className="flex justify-between items-center text-sm p-2 bg-background rounded">
                                    <div>
                                        <p className="font-medium">{material?.name || 'Material não encontrado'}</p>
                                        <p className="text-xs text-textSecondary">SKU: {material?.sku || 'N/A'}</p>
                                    </div>
                                    <p className="font-semibold">{item.quantity_per_unit} {material?.unit}</p>
                                </div>
                            );
                        })
                    ) : (
                        <p className="text-sm text-textSecondary">Nenhuma lista de materiais (BOM) definida para este produto/variante.</p>
                    )}
                </div>
            </Section>
        </div>
    );
};

export default ProductionOrderDetailPanel;