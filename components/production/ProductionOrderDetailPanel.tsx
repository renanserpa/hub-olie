import React, { useState } from 'react';
import { ProductionOrder, Material, ProductionTask, ProductionTaskStatus, ProductionQualityCheck, QualityCheckResult } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Info, ListChecks, Package, ShieldCheck, Play, Check, Pause, Plus, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import ProductionOrderCard from './ProductionOrderCard';
import { Button } from '../ui/Button';

interface ProductionOrderDetailPanelProps {
    order: ProductionOrder;
    allMaterials: Material[];
    onUpdateTaskStatus: (taskId: string, status: ProductionTaskStatus) => void;
    onCreateQualityCheck: (check: Omit<ProductionQualityCheck, 'id' | 'created_at'>) => void;
}

const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div>
        <p className="text-xs text-textSecondary">{label}</p>
        <p className="font-medium text-textPrimary">{value || '-'}</p>
    </div>
);

const QualityCheckForm: React.FC<{ orderId: string; onCreate: (check: any) => void }> = ({ orderId, onCreate }) => {
    const [checkType, setCheckType] = useState('');
    const [result, setResult] = useState<QualityCheckResult>('Aprovado');
    const [inspector, setInspector] = useState('');
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!checkType || !inspector) return;
        onCreate({ production_order_id: orderId, check_type: checkType, result, inspector });
        setCheckType('');
        setResult('Aprovado');
        setInspector('');
    };

    return (
        <form onSubmit={handleSubmit} className="p-3 bg-secondary/50 rounded-lg space-y-2 text-sm">
             <input value={checkType} onChange={e => setCheckType(e.target.value)} placeholder="Tipo de Inspeção (ex: Medidas)" className="w-full p-1 border rounded" required />
             <input value={inspector} onChange={e => setInspector(e.target.value)} placeholder="Nome do Inspetor" className="w-full p-1 border rounded" required />
             <select value={result} onChange={e => setResult(e.target.value as QualityCheckResult)} className="w-full p-1 border rounded">
                <option value="Aprovado">Aprovado</option>
                <option value="Reprovado">Reprovado</option>
                <option value="Pendente">Pendente</option>
             </select>
             <Button type="submit" size="sm" className="w-full">Salvar Inspeção</Button>
        </form>
    );
};


const ProductionOrderDetailPanel: React.FC<ProductionOrderDetailPanelProps> = ({ order, allMaterials, onUpdateTaskStatus, onCreateQualityCheck }) => {
    const [activeTab, setActiveTab] = useState('tasks');
    const [showAddQuality, setShowAddQuality] = useState(false);

    const formatDate = (dateValue?: any) => {
        if (!dateValue) return '-';
        const date = dateValue.toDate ? dateValue.toDate() : new Date(dateValue);
        if (isNaN(date.getTime())) return '-';
        return date.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const TABS = [
        { id: 'info', label: 'Informações', icon: Info },
        { id: 'tasks', label: 'Tarefas', icon: ListChecks },
        { id: 'quality', label: 'Qualidade', icon: ShieldCheck },
        { id: 'materials', label: 'Materiais', icon: Package },
    ];

    const renderInfoTab = () => (
        <div className="space-y-4 p-4">
            <div className="grid grid-cols-2 gap-4">
                 <DetailItem label="Produto" value={order.product?.name} />
                 <DetailItem label="Quantidade" value={order.quantity} />
                 <DetailItem label="Prioridade" value={order.priority.charAt(0).toUpperCase() + order.priority.slice(1)} />
                 <DetailItem label="Prazo Final" value={formatDate(order.due_date)} />
                 <DetailItem label="Operador" value={order.operator} />
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
    );
    
    const renderTasksTab = () => (
        <div className="space-y-2 p-4">
            {order.tasks?.map(task => (
                <div key={task.id} className="p-3 bg-secondary rounded-lg">
                    <p className="font-medium">{task.name}</p>
                    <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-textSecondary">{task.status}</span>
                        <div className="flex gap-1">
                             {task.status === 'Pendente' && <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => onUpdateTaskStatus(task.id, 'Em Andamento')}><Play size={12} className="mr-1"/> Iniciar</Button>}
                             {task.status === 'Em Andamento' && <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => onUpdateTaskStatus(task.id, 'Concluída')}><Check size={12} className="mr-1"/> Finalizar</Button>}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    const renderQualityTab = () => (
        <div className="p-4 space-y-3">
            {!showAddQuality ? (
                <Button size="sm" variant="outline" className="w-full" onClick={() => setShowAddQuality(true)}><Plus size={14} className="mr-2"/>Registrar Inspeção</Button>
            ) : (
                <QualityCheckForm orderId={order.id} onCreate={(check) => { onCreateQualityCheck(check); setShowAddQuality(false); }} />
            )}

            {order.quality_checks && order.quality_checks.length > 0 ? (
                <div className="space-y-2">
                    {order.quality_checks.map(qc => (
                        <div key={qc.id} className="p-2 bg-secondary rounded-md text-sm">
                            <div className="flex justify-between">
                                <span className="font-semibold">{qc.check_type}</span>
                                <span className={cn("font-bold", qc.result === 'Aprovado' ? 'text-green-600' : 'text-red-600')}>{qc.result}</span>
                            </div>
                            <p className="text-xs text-textSecondary">Inspetor: {qc.inspector}</p>
                        </div>
                    ))}
                </div>
            ) : <p className="text-sm text-center text-textSecondary py-4">Nenhuma inspeção registrada.</p>}
        </div>
    );

    const renderMaterialsTab = () => (
        <div className="space-y-2 p-4">
             {order.product?.bom && order.product.bom.length > 0 ? (
                order.product.bom.map(item => {
                    const material = allMaterials.find(m => m.id === item.material_id);
                    const totalQuantity = item.quantity_per_unit * order.quantity;
                    return (
                        <div key={item.material_id} className="flex justify-between items-center p-2 bg-secondary/50 rounded-md">
                            <div>
                                <p className="font-medium text-textPrimary">{material?.name || 'Material não encontrado'}</p>
                                <p className="text-xs">{item.quantity_per_unit.toFixed(2)} {material?.unit} por unidade</p>
                            </div>
                            <p className="font-bold text-primary">{totalQuantity.toFixed(2)} <span className="text-xs font-normal text-textSecondary">{material?.unit}</span></p>
                        </div>
                    );
                })
             ) : <p className="text-sm text-center text-textSecondary py-4">Nenhuma lista de materiais (BOM) cadastrada.</p>}
        </div>
    );


    return (
        <Card className="sticky top-20 h-[calc(100vh-25rem)] overflow-y-auto">
            <div className="p-4 border-b border-border">
                <ProductionOrderCard order={order} isSelected={false} onClick={() => {}} />
            </div>
            
            <div className="border-b border-border">
                <nav className="flex space-x-2 p-1">
                    {TABS.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={cn('flex-1 flex items-center justify-center gap-2 text-xs font-medium p-2 rounded-md transition-colors',
                                activeTab === tab.id ? 'bg-accent text-primary' : 'text-textSecondary hover:bg-accent/50'
                            )}
                        >
                            <tab.icon size={14}/> {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {activeTab === 'info' && renderInfoTab()}
            {activeTab === 'tasks' && renderTasksTab()}
            {activeTab === 'quality' && renderQualityTab()}
            {activeTab === 'materials' && renderMaterialsTab()}
        </Card>
    );
};

export default ProductionOrderDetailPanel;