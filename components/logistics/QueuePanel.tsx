import React from 'react';
import { Order } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Plus, PackageSearch } from 'lucide-react';
import { Badge } from '../ui/Badge';

interface QueuePanelProps {
    orders: Order[];
    onNewWaveClick: () => void;
}

const QueuePanel: React.FC<QueuePanelProps> = ({ orders, onNewWaveClick }) => {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Fila de Separação</CardTitle>
                <Button onClick={onNewWaveClick}>
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Onda
                </Button>
            </CardHeader>
            <CardContent>
                {orders.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-secondary">
                                <tr>
                                    <th className="p-4 font-semibold text-textSecondary">Pedido</th>
                                    <th className="p-4 font-semibold text-textSecondary">Cliente</th>
                                    <th className="p-4 font-semibold text-textSecondary">Itens</th>
                                    <th className="p-4 font-semibold text-textSecondary">Data</th>
                                    <th className="p-4 font-semibold text-textSecondary">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(order => (
                                    <tr key={order.id} className="border-b border-border">
                                        <td className="p-4 font-medium text-textPrimary">{order.number}</td>
                                        <td className="p-4">{order.customers?.name}</td>
                                        <td className="p-4">{order.items.reduce((acc, item) => acc + item.quantity, 0)}</td>
                                        <td className="p-4">{new Date(order.created_at).toLocaleDateString('pt-BR')}</td>
                                        <td className="p-4">
                                            <Badge variant="secondary" className="capitalize">{order.status.replace(/_/g, ' ')}</Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center text-textSecondary py-16 border-2 border-dashed border-border rounded-xl">
                        <PackageSearch className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-4 text-lg font-medium text-textPrimary">Fila de Separação Vazia</h3>
                        <p className="mt-1 text-sm">Não há pedidos prontos para iniciar a separação.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default QueuePanel;