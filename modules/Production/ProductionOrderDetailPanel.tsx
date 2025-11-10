import React, { useState } from 'react';
import { ProductionOrder, Material, BOMComponent, ProductionRoute, ProductionTaskStatus, ProductionQualityCheck, AuthUser, ProductionTask, QualityCheckResult } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { cn } from '../../lib/utils';
import { Button } from '../../components/ui/Button';

const DetailItem: React.FC<{ label: string; value?: string | number | null; }> = ({ label, value }) => (
    <div>
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
    order: ProductionOrder & { product?: any; tasks?: ProductionTask[]; quality_checks?: ProductionQualityCheck[] };
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
        onCreate({ production_order_id: orderId, inspector: user?.email || 'Sistema', result, notes, });
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
                <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Observações" className="p-2 border rounded-md text-sm" />
            </div>
            <Button type="submit" size="sm" className="w-full">Registrar</Button>
        </form>
    );
};

const ProductionOrderDetailPanel: React.FC<ProductionOrderDetailPanelProps> = ({ order, allMaterials, onUpdateTaskStatus, onCreateQualityCheck, user }) => {
    const taskStatusOptions: ProductionTaskStatus[] = ['Pendente', 'Em Andamento', 'Concluída'];
    const qualityResultConfig = { 'Aprovado': 'bg-green-100 text-green-800', 'Reprovado': 'bg-red-100 text-red-800', 'Pendente': 'bg-yellow-100 text-yellow-800' };

    return (
        <div className="space-y-2">
            <Section title="Resumo da OP">
                 <div className="grid grid-cols-3 gap-x-4">
                    <div>
                        <p className="text-xs text-textSecondary">Status</p>
                        <Badge variant="secondary" className="capitalize mt-1">{order.status.replace(/_/g, ' ')}</Badge>
                    </div>
                    <DetailItem label="Quantidade" value={order.quantity} />
                    <DetailItem label="Prazo Final" value={new Date(order.due_date).toLocaleDateString('pt-BR')} />
                 </div>
            </Section>

            <Section title="Tarefas da OP">
                <div className="space-y-3">
                    {order.tasks?.map(task => (
                        <div key={task.id} className="p-3 border rounded-lg">
                            <span className="font-medium text-sm">{task.name}</span>
                            <div className="flex gap-2 mt-2">
                                {taskStatusOptions.map(status => (
                                    <Button key={status} size="sm" variant={task.status === status ? 'primary' : 'outline'} onClick={() => onUpdateTaskStatus(task.id, status)} className="text-xs flex-1">
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
                            <p className="text-sm font-semibold">{check.inspector} - <Badge className={cn(qualityResultConfig[check.result])}>{check.result}</Badge></p>
                            <p className="text-xs text-textSecondary mt-1">{check.notes}</p>
                        </div>
                    ))}
                    <QualityCheckForm orderId={order.id} user={user} onCreate={onCreateQualityCheck} />
                </div>
            </Section>
            
            <Section title="Lista de Materiais (BOM)">
                <div className="space-y-2">
                     {(order.product?.base_bom || []).map((item: BOMComponent, index: number) => {
                        const material = allMaterials.find(m => m.id === item.material_id);
                        return (
                            <div key={index} className="flex justify-between items-center text-sm p-2 bg-background rounded">
                                <span>{material?.name || 'Material não encontrado'}</span>
                                <span className="font-semibold">{item.quantity_per_unit} {material?.unit}</span>
                            </div>
                        );
                    })}
                </div>
            </Section>
        </div>
    );
};

export default ProductionOrderDetailPanel;