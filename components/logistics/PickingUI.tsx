import React, { useState, useMemo } from 'react';
import { LogisticsPickTask } from '../../types';
import { usePickingWave } from '../../hooks/usePickingWave';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Loader2, Package, CheckCircle, XCircle, Scan, ArrowLeft } from 'lucide-react';
import { cn } from '../../lib/utils';

interface PickingUIProps {
  waveId: string;
  onBack: () => void;
}

const PickingTaskCard: React.FC<{ task: LogisticsPickTask, pickItem: (taskId: string, quantity: number) => Promise<void> }> = ({ task, pickItem }) => {
  const [scanInput, setScanInput] = useState('');
  
  const isCompleted = task.status === 'picked';
  const quantityLeft = task.quantity - (task.picked_quantity || 0);
  const isPicking = task.status === 'picking';

  const handleScan = () => {
    // In a real scenario, we would compare with task.variant_sku or a barcode field
    // For simplicity, we check if input matches SKU or just simple numeric entry for quantity
    // Here we assume simple 1-click picking or quantity entry for simulation if no scanner
    
    const inputQty = parseInt(scanInput);
    
    // If input matches SKU (simulated)
    if (scanInput && scanInput.toUpperCase() === (task.variant_sku || '').toUpperCase()) {
         pickItem(task.id, 1);
         setScanInput('');
    } 
    // If input is a number, treat as quantity
    else if (!isNaN(inputQty) && inputQty > 0) {
        if (inputQty > quantityLeft) {
             // Error handled in hook/toast
        } else {
             pickItem(task.id, inputQty);
             setScanInput('');
        }
    } else {
        // Simulate simple click-to-pick 1 item if input is empty
        pickItem(task.id, 1);
    }
  };

  const getStatusColor = (status: LogisticsPickTask['status']) => {
    switch (status) {
      case 'picked': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-200 dark:border-green-800';
      case 'picking': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-200 dark:border-yellow-800';
      case 'pending':
      default: return 'bg-secondary border-border';
    }
  };

  return (
    <Card className={cn("transition-all border-l-4", isCompleted ? 'border-l-green-500 opacity-70' : 'border-l-blue-500')}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-primary" />
                <div>
                    <h3 className="font-bold text-base">{task.product_name}</h3>
                    <p className="text-xs text-textSecondary font-mono">{task.variant_sku || 'SKU Indisponível'}</p>
                </div>
            </div>
            <Badge className={cn(getStatusColor(task.status))}>
                {isCompleted ? 'CONCLUÍDO' : task.status === 'picking' ? 'EM ANDAMENTO' : 'PENDENTE'}
            </Badge>
        </div>
        
        <div className="flex justify-between items-center my-4 p-3 bg-secondary/50 rounded-lg">
            <span className="text-sm font-medium">Progresso:</span>
            <div className="text-lg font-bold">
                <span className={isCompleted ? 'text-green-600' : 'text-primary'}>{task.picked_quantity || 0}</span>
                <span className="text-textSecondary mx-1">/</span>
                <span>{task.quantity}</span>
            </div>
        </div>

        {!isCompleted && (
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Qtd ou SKU..."
              value={scanInput}
              onChange={(e) => setScanInput(e.target.value)}
              className="flex-grow p-2 border rounded-md text-sm bg-background"
              onKeyDown={(e) => e.key === 'Enter' && handleScan()}
            />
            <Button 
              onClick={handleScan} 
              disabled={isCompleted || quantityLeft <= 0}
              className="flex-shrink-0"
            >
              <Scan className="w-4 h-4 mr-2" />
              Pick (+1)
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const PickingUI: React.FC<PickingUIProps> = ({ waveId, onBack }) => {
  const { tasks, isLoading, error, pickItem, refresh } = usePickingWave(waveId);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'PICKED'>('PENDING');

  const filteredTasks = useMemo(() => {
    if (filter === 'ALL') return tasks;
    return tasks.filter(t => filter === 'PENDING' ? t.status !== 'picked' : t.status === 'picked');
  }, [tasks, filter]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-textSecondary">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="mt-4">Carregando tarefas da Onda...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 border border-red-200 text-red-800 rounded-lg flex flex-col items-center">
        <XCircle className="w-8 h-8 mb-2" />
        <p className="font-medium">Erro ao carregar dados</p>
        <p className="text-sm mb-4">{error}</p>
        <Button onClick={refresh} variant="outline">Tentar Novamente</Button>
        <Button onClick={onBack} variant="ghost" className="mt-2">Voltar</Button>
      </div>
    );
  }
  
  const allCompleted = tasks.length > 0 && tasks.every(t => t.status === 'picked');
  const pendingCount = tasks.filter(t => t.status !== 'picked').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="w-5 h-5" /></Button>
            <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Scan className="w-5 h-5 text-primary" />
                    Picking Onda #{waveId.slice(0, 8)}
                </h2>
                <p className="text-sm text-textSecondary">
                    Itens: <strong>{tasks.length}</strong> | Pendentes: <strong className="text-orange-600">{pendingCount}</strong>
                </p>
            </div>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button 
            variant={filter === 'PENDING' ? 'primary' : 'outline'} 
            size="sm" 
            onClick={() => setFilter('PENDING')}
        >
            Pendentes
        </Button>
         <Button 
            variant={filter === 'PICKED' ? 'primary' : 'outline'} 
            size="sm" 
            onClick={() => setFilter('PICKED')}
        >
            Concluídos
        </Button>
        <Button 
            variant={filter === 'ALL' ? 'primary' : 'outline'} 
            size="sm" 
            onClick={() => setFilter('ALL')}
        >
            Todos
        </Button>
      </div>

      <div className="space-y-4">
        {allCompleted && filter !== 'PICKED' && (
          <div className="p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 rounded-xl text-center flex flex-col items-center">
            <CheckCircle className="w-12 h-12 mb-2" />
            <h3 className="font-bold text-lg">Onda Concluída!</h3>
            <p className="text-sm">Todos os itens foram separados com sucesso.</p>
            <Button className="mt-4" onClick={onBack}>Voltar para Ondas</Button>
          </div>
        )}
        
        {filteredTasks.length === 0 && !allCompleted ? (
          <div className="text-center text-textSecondary py-10">
            Nenhuma tarefa encontrada com este filtro.
          </div>
        ) : (
          filteredTasks.map(task => (
            <PickingTaskCard 
              key={task.id} 
              task={task} 
              pickItem={pickItem} 
            />
          ))
        )}
      </div>
    </div>
  );
};