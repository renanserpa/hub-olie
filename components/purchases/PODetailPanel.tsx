import React from 'react';
import { PurchaseOrder } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import POItemTable from './POItemTable';
import { Loader2 } from 'lucide-react';

interface PODetailPanelProps {
    po: PurchaseOrder & { supplier?: any, items: any[] };
    onReceiveClick: () => void;
    isSaving: boolean;
    isLoadingItems: boolean;
}

const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div>
        <p className="text-xs text-textSecondary">{label}</p>
        <p className="font-medium text-textPrimary">{value || '-'}</p>
    </div>
);

const PODetailPanel: React.FC<PODetailPanelProps> = ({ po, onReceiveClick, isSaving, isLoadingItems }) => {
    const canReceive = po.status === 'issued' || po.status === 'partial';

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
                    {isLoadingItems ? (
                        <div className="flex justify-center items-center h-24">
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        </div>
                    ) : (
                        <POItemTable items={po.items} />
                    )}
                </div>

                <div className="flex flex-wrap gap-2 pt-4 border-t">
                    {po.status === 'draft' && <Button size="sm" disabled={isSaving}>Emitir PO</Button>}
                    {canReceive && <Button size="sm" onClick={onReceiveClick} disabled={isSaving}>Receber Materiais</Button>}
                    <Button variant="outline" size="sm" disabled={isSaving}>Duplicar</Button>
                    {po.status === 'draft' && <Button variant="outline" size="sm" className="text-red-600" disabled={isSaving}>Cancelar</Button>}
                </div>
            </CardContent>
        </Card>
    );
};

export default PODetailPanel;