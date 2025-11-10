import React, { useState } from 'react';
import { ProductionOrder, Material, BOMComponent, ProductionRoute, ProductionTaskStatus, ProductionQualityCheck, AuthUser, ProductionTask, QualityCheckResult } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { cn } from '../../lib/utils';
import { Button } from '../../components/ui/Button';
import { CheckCircle, Circle, Loader2 } from 'lucide-react';

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
    order: ProductionOrder & { product?: any; tasks?: ProductionTask[]; variant?: any; route?: ProductionRoute; quality_checks?: ProductionQualityCheck[] };
    allMaterials: Material[];
    onUpdateTaskStatus: (taskId: string, status: ProductionTaskStatus) => void;
    onCreateQualityCheck: (check: Omit<ProductionQualityCheck, 'id' | 'created_at'>) => void;
    user: AuthUser | null;
}

const QualityCheckForm: React.FC<{ orderId: string; user: AuthUser | null; onCreate: (data: any) => void }> = ({ orderId, user, onCreate }) => {
    const [result, setResult] = useState<QualityCheckResult>('Aprovado');
    const [notes, setNotes] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onCreate({
            production_order_id: orderId,
            inspector: user?.email || 'Sistema',
            result,
            notes,
        });
        setNotes('');
    };
    
    return (
        <form onSubmit={handleSubmit} className="p-3 bg-secondary rounded-lg space-y-2 mt-2">
            <h5 className="text-sm font-semibold">Registrar Nova Inspeção</h5>
            <div className="grid grid-cols-2 gap-2">
                <select value={result} onChange={(e) => setResult(e.target.value as QualityCheckResult)} className="p-2 border rounded-md text-sm">
                    <option value="Aprovado">Aprovado</option>
                    <option value="Reprovado">Reprovado</option>
                </select>
                <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Observações (opcional)" className="p-2 border rounded-md text-sm" />
            </div>
            <Button type="submit" size="sm" className="w-full">Registrar</Button>
        </form>
    );
};


const ProductionOrderDetailPanel: React.FC<ProductionOrderDetailPanelProps> = ({ order, allMaterials, onUpdateTaskStatus, onCreateQualityCheck, user }) => {
    
    const bomToShow: BOMComponent[] | undefined = order.variant?.bom && order.variant.bom.length > 0 
        ? order.variant.bom 
        : order.product?.base_bom;
        
    const bomTitle = order.variant?.bom && order.variant.bom.length > 0 
        ? "Materiais (BOM da Variante)" 
        : "Materiais (BOM Base)";

    const taskStatusOptions: ProductionTaskStatus[] = ['Pendente', 'Em Andamento', 'Concluída'];
    const qualityResultConfig = {
        'Aprovado': 'bg-green-100 text-green-800',
        'Reprovado': 'bg-red-100 text-red-800',
        'Pendente': 'bg-yellow-100 text-yellow-800',
    };

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

            <Section title="Tarefas da OP">
                <div className="space-y-3">
                    {order.tasks?.map(task => (
                        <div key={task.id} className="p-3 border rounded-lg">
                            <div className="flex justify-between items-center">
                                <span className="font-medium text-sm">{task.name}</span>
                                <Badge variant={task.status === 'Concluída' ? 'ativo' : 'secondary'}>{task.status}</Badge>
                            </div>
                            <div className="flex gap-2 mt-2">
                                {taskStatusOptions.map(status => (
                                    <Button
                                        key={status}
                                        size="sm"
                                        variant={task.status === status ? 'primary' : 'outline'}
                                        onClick={() => onUpdateTaskStatus(task.id, status)}
                                        className="text-xs flex-1"
                                    >
                                        {status}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </Section>

            <Section title="Controle de Qualidade">
                <div className="space-y-2">
                    {order.quality_checks?.map(check => (
                        <div key={check.id} className="p-3 bg-secondary rounded-lg">
                            <div className="flex justify-between items-center">
                                <p className="text-sm font-semibold">{check.inspector}</p>
                                <Badge className={cn(qualityResultConfig[check.result])}>{check.result}</Badge>
                            </div>
                            <p className="text-xs text-textSecondary mt-1">{check.notes}</p>
                            <p className="text-xs text-textSecondary/70 mt-1">{new Date(check.created_at).toLocaleString('pt-BR')}</p>
                        </div>
                    ))}
                    <QualityCheckForm orderId={order.id} user={user} onCreate={onCreateQualityCheck} />
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
