import React from 'react';
import { LogisticsWave, LogisticsPickTask } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Boxes, PackageCheck } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface PickingPackingPanelProps {
    waves: LogisticsWave[];
    pickTasks: LogisticsPickTask[];
}

const PickingPackingPanel: React.FC<PickingPackingPanelProps> = ({ waves, pickTasks }) => {
    const activeWaves = waves.filter(w => w.status === 'pending' || w.status === 'picking');

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
            {activeWaves.map(wave => {
                const tasksForWave = pickTasks.filter(t => t.wave_id === wave.id);
                return (
                    <Card key={wave.id}>
                        <CardHeader className="flex flex-row justify-between items-center">
                            <div>
                                <CardTitle>Onda: {wave.wave_number}</CardTitle>
                                <p className="text-sm text-textSecondary">{wave.order_ids.length} pedidos</p>
                            </div>
                            <Button size="sm">Iniciar Picking</Button>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="p-2 text-left">Produto</th>
                                            <th className="p-2 text-left">Pedido</th>
                                            <th className="p-2 text-center">Qtd. a Separar</th>
                                            <th className="p-2 text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tasksForWave.map(task => (
                                            <tr key={task.id} className="border-b last:border-b-0">
                                                <td className="p-2 font-medium">{task.product_name}</td>
                                                <td className="p-2 text-textSecondary font-mono">{task.order_id.slice(0,8)}...</td>
                                                <td className="p-2 text-center font-semibold">{task.quantity}</td>
                                                <td className="p-2 text-center"><Badge variant="secondary" className="capitalize">{task.status}</Badge></td>
                                            </tr>
                                        ))}
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