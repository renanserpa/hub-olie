import React, { useState } from 'react';
import { ProductionOrder } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { ChevronDown, Info, ListChecks, Package, Calendar, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';
import ProductionOrderCard from './ProductionOrderCard'; // Re-use for header

interface CollapsibleSectionProps {
    title: string;
    icon: React.ElementType;
    children: React.ReactNode;
    defaultOpen?: boolean;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ title, icon: Icon, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="border-b border-border last:border-b-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-4 text-left font-medium text-textPrimary hover:bg-secondary/50"
            >
                <span className="flex items-center gap-3">
                    <Icon size={16} className="text-textSecondary" />
                    {title}
                </span>
                <ChevronDown size={18} className={cn('transition-transform', isOpen && 'rotate-180')} />
            </button>
            {isOpen && <div className="p-4 pt-0 text-sm text-textSecondary">{children}</div>}
        </div>
    );
};


const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div>
        <p className="text-xs text-textSecondary">{label}</p>
        <p className="font-medium text-textPrimary">{value || '-'}</p>
    </div>
);


const ProductionOrderDetailPanel: React.FC<{ order: ProductionOrder }> = ({ order }) => {

    const formatDate = (dateValue?: any) => {
        if (!dateValue) return '-';
        const date = dateValue.toDate ? dateValue.toDate() : new Date(dateValue);
        if (isNaN(date.getTime())) return '-';
        return date.toLocaleString('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <Card className="sticky top-20 h-[calc(100vh-10rem)] overflow-y-auto">
            <div className="p-4 border-b border-border">
                <ProductionOrderCard order={order} isSelected={false} onClick={() => {}} />
            </div>
            
            <CollapsibleSection title="Informações" icon={Info} defaultOpen>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                         <DetailItem label="Produto" value={order.product?.name} />
                         <DetailItem label="Quantidade" value={order.quantity} />
                         <DetailItem label="Prioridade" value={order.priority.charAt(0).toUpperCase() + order.priority.slice(1)} />
                         <DetailItem label="Prazo Final" value={formatDate(order.due_date)} />
                    </div>
                    <div>
                         <DetailItem label="Observações" value={order.notes} />
                    </div>
                    <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
                        <DetailItem label="Criado em" value={formatDate(order.created_at)} />
                        <DetailItem label="Iniciado em" value={formatDate(order.started_at)} />
                        <DetailItem label="Finalizado em" value={formatDate(order.completed_at)} />
                        <DetailItem label="Última Atualização" value={formatDate(order.updated_at)} />
                    </div>
                </div>
            </CollapsibleSection>
            
            <CollapsibleSection title="Etapas" icon={ListChecks}>
                 <div className="text-center p-6 bg-secondary rounded-lg">
                    <p className="font-medium">🚧 Em desenvolvimento</p>
                    <p className="text-xs">Acompanhamento de etapas de produção e apontamentos de tempo.</p>
                </div>
            </CollapsibleSection>

             <CollapsibleSection title="Materiais" icon={Package}>
                <div className="text-center p-6 bg-secondary rounded-lg">
                    <p className="font-medium">🚧 Em desenvolvimento</p>
                    <p className="text-xs">Lista de materiais, consumo real vs. planejado e baixas de estoque.</p>
                </div>
            </CollapsibleSection>
            
             <CollapsibleSection title="Qualidade" icon={Calendar}>
                 <div className="text-center p-6 bg-secondary rounded-lg">
                    <p className="font-medium">📅 Planejado</p>
                     <p className="text-xs">Inspeções, checklists e aprovações de qualidade.</p>
                </div>
            </CollapsibleSection>
            
            <CollapsibleSection title="Timeline" icon={Clock}>
                 <div className="text-center p-6 bg-secondary rounded-lg">
                    <p className="font-medium">🕒 Planejado</p>
                     <p className="text-xs">Histórico completo de eventos e alterações da OP.</p>
                </div>
            </CollapsibleSection>
        </Card>
    );
};

export default ProductionOrderDetailPanel;