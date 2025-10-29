import React from 'react';
import { PurchaseOrder } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import POItemTable from './POItemTable';

interface PODetailPanelProps {
    po: PurchaseOrder & { supplier?: any, items: any[] };
}

const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div>
        <p className="text-xs text-textSecondary">{label}</p>
        <p className="font-medium text-textPrimary">{value || '-'}</p>
    </div>
);

const PODetailPanel: React.FC<PODetailPanelProps> = ({ po }) => {
    return (
        <Card className="sticky top-20 h-[calc(100vh-18rem)] overflow-y-auto">
            <CardHeader>
                <CardTitle>{po.po_number}</CardTitle>
                <p className="text-sm text-textSecondary">Fornecedor: {po.supplier?.name}</p>
            </CardHeader>
            <CardContent>
                <div className="space-y-4 mb-6">
                    <div className="grid grid-cols-2 gap-4">
                        <DetailItem label="Data de Emissão" value={po.issued_at ? new Date(po.issued_at).toLocaleDateString('pt-BR') : 'N/A'} />
                        <DetailItem label="Entrega Prevista" value={po.expected_delivery_date ? new Date(po.expected_delivery_date).toLocaleDateString('pt-BR') : 'N/A'} />
                        <DetailItem label="Status" value={po.status} />
                        <DetailItem label="Total" value={`R$ ${po.total.toFixed(2)}`} />
                    </div>
                </div>

                <div className="mb-6">
                    <h4 className="font-semibold text-md mb-2">Itens do Pedido</h4>
                    <POItemTable items={po.items} />
                </div>

                <div className="flex flex-wrap gap-2 pt-4 border-t">
                    {po.status === 'draft' && <Button size="sm">Emitir PO</Button>}
                    {po.status === 'issued' && <Button size="sm">Receber Materiais</Button>}
                    {po.status === 'partial' && <Button size="sm">Finalizar Recebimento</Button>}
                    <Button variant="outline" size="sm">Duplicar</Button>
                    <Button variant="outline" size="sm" className="text-red-600">Cancelar</Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default PODetailPanel;