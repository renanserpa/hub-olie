import React, { useState } from 'react';
import { LogisticsWave, LogisticsPickTask } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Boxes, PackageCheck, ArrowRight } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { PickingUI } from './PickingUI';
import { cn } from '../../lib/utils';

interface PickingPackingPanelProps {
    waves: LogisticsWave[];
    pickTasks: LogisticsPickTask[];
}

const PickingPackingPanel: React.FC<PickingPackingPanelProps> = ({ waves, pickTasks }) => {
    const [selectedWaveId, setSelectedWaveId] = useState<string | null>(null);
    const activeWaves = waves.filter(w => w.status === 'pending' || w.status === 'picking');

    if (selectedWaveId) {
        return <PickingUI waveId={selectedWaveId} onBack={() => setSelectedWaveId(null)} />;
    }

    if (activeWaves.length === 0) {
        return (
            <div className="text-center text-textSecondary py-16 border-2 border-dashed border-border rounded-xl">
                <PackageCheck className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-textPrimary">Nenhuma Onda de Separação Ativa</h3>
                <p className="mt-1 text-sm">Crie uma nova onda na aba "Fila & Ondas" para iniciar o processo de picking.</p>
            </div>
        );
    }
    
    return (
        <div className="space-y-6">
            <h2 className="text-lg font-semibold mb-4">Ondas Disponíveis para Separação</h2>
            {activeWaves.map(wave => {
                const tasksForWave = pickTasks.filter(t => t.wave_id === wave.id);
                const pendingTasks = tasksForWave.filter(t => t.status !== 'picked').length;
                const totalTasks = tasksForWave.length;
                const progress = totalTasks > 0 ? Math.round(((totalTasks - pendingTasks) / totalTasks) * 100) : 0;

                return (
                    <Card key={wave.id} className="hover:border-primary/50 transition-colors">
                        <CardHeader className="flex flex-row justify-between items-center pb-2">
                            <div>
                                <CardTitle className="text-base">Onda: {wave.wave_number}</CardTitle>
                                <p className="text-sm text-textSecondary">{wave.order_ids.length} pedidos | {totalTasks} itens</p>
                            </div>
                            <Button size="sm" onClick={() => setSelectedWaveId(wave.id)}>
                                Iniciar Picking <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </CardHeader>
                        <CardContent>
                             <div className="w-full bg-secondary rounded-full h-2.5 mb-4">
                                <div className="bg-primary h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                            </div>
                            <div className="flex justify-between text-xs text-textSecondary mb-4">
                                <span>Progresso: {progress}%</span>
                                <span>{totalTasks - pendingTasks} de {totalTasks} itens separados</span>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-left">
                                            <th className="p-2 font-normal text-textSecondary">Produto</th>
                                            <th className="p-2 font-normal text-textSecondary text-center">Qtd</th>
                                            <th className="p-2 font-normal text-textSecondary text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tasksForWave.slice(0, 5).map(task => (
                                            <tr key={task.id} className="border-b last:border-b-0">
                                                <td className="p-2 font-medium truncate max-w-[200px]">{task.product_name}</td>
                                                <td className="p-2 text-center font-semibold">
                                                    {task.picked_quantity || 0}/{task.quantity}
                                                </td>
                                                <td className="p-2 text-center">
                                                    <Badge variant="secondary" className={cn("capitalize text-[10px]", task.status === 'picked' && "bg-green-100 text-green-800")}>
                                                        {task.status === 'picked' ? 'OK' : 'Pendente'}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))}
                                        {tasksForWave.length > 5 && (
                                            <tr>
                                                <td colSpan={3} className="p-2 text-center text-xs text-textSecondary italic">
                                                    + {tasksForWave.length - 5} outros itens...
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    );
};

export default PickingPackingPanel;