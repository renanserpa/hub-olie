import React from 'react';
import { ProductionOrder } from '../../types';
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
    order: ProductionOrder & { product?: any, tasks?: any[] };
}

const ProductionOrderDetailPanel: React.FC<ProductionOrderDetailPanelProps> = ({ order }) => {
    
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
            
            <Section title="Tarefas de Produção">
                <div className="space-y-2">
                    {order.tasks && order.tasks.length > 0 ? (
                        order.tasks.map(task => (
                            <div key={task.id} className="p-2 border rounded-md bg-secondary/50 flex justify-between items-center">
                                <div>
                                    <p className="font-medium text-sm">{task.title.split(' - ')[1] || task.title}</p>
                                    <p className="text-xs text-textSecondary">{task.statusName}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-textSecondary">Nenhuma tarefa associada a esta OP.</p>
                    )}
                </div>
            </Section>

            <Section title="Materiais Necessários (BOM)">
                <div className="space-y-2">
                     {order.product?.bom && order.product.bom.length > 0 ? (
                         order.product.bom.map((item: any, index: number) => (
                            <div key={index} className="p-2 border rounded-md bg-secondary/50 flex justify-between items-center">
                                <p className="font-medium text-sm">{item.material_id}</p>
                                <p className="text-sm">{item.quantity_per_unit * order.quantity} unidades</p>
                            </div>
                         ))
                     ) : (
                        <p className="text-sm text-textSecondary">Nenhuma lista de materiais (BOM) cadastrada para este produto.</p>
                     )}
                </div>
            </Section>
        </div>
    );
};

export default ProductionOrderDetailPanel;