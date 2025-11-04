import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { Button } from '../ui/Button';
import { PurchaseOrder } from '../../types';
import { toast } from '../../hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface ReceivePODialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (poId: string, receivedItems: { itemId: string; receivedQty: number }[]) => Promise<void>;
    purchaseOrder: PurchaseOrder;
    isSaving: boolean;
}

const ReceivePODialog: React.FC<ReceivePODialogProps> = ({ isOpen, onClose, onSave, purchaseOrder, isSaving }) => {
    const [receivedQuantities, setReceivedQuantities] = useState<Record<string, number>>({});

    useEffect(() => {
        if (isOpen) {
            const initialQtys = purchaseOrder.items.reduce((acc, item) => {
                const remaining = item.quantity - item.received_quantity;
                acc[item.id] = Math.max(0, remaining); // Pre-fill with remaining quantity
                return acc;
            }, {} as Record<string, number>);
            setReceivedQuantities(initialQtys);
        }
    }, [isOpen, purchaseOrder]);

    const handleQtyChange = (itemId: string, value: string) => {
        setReceivedQuantities(prev => ({ ...prev, [itemId]: parseFloat(value) || 0 }));
    };

    const handleSubmit = async () => {
        const receivedItems = Object.entries(receivedQuantities)
            .filter(([, qty]: [string, number]) => qty > 0)
            .map(([itemId, receivedQty]) => ({ itemId, receivedQty }));
        
        if (receivedItems.length === 0) {
            toast({ title: 'Atenção', description: 'Nenhuma quantidade foi informada para recebimento.', variant: 'destructive' });
            return;
        }
        await onSave(purchaseOrder.id, receivedItems);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Receber Materiais - ${purchaseOrder.po_number}`}>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                {purchaseOrder.items.map(item => {
                    const remaining = item.quantity - item.received_quantity;
                    return (
                        <div key={item.id} className="p-3 border rounded-lg grid grid-cols-3 gap-4 items-center">
                            <div className="col-span-2">
                                <p className="font-medium text-sm">{item.material?.name || item.material_name}</p>
                                <p className="text-xs text-textSecondary">
                                    Pedido: {item.quantity} | Recebido: {item.received_quantity} | <span className="font-semibold">Pendente: {remaining}</span>
                                </p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-textSecondary">Receber agora</label>
                                <input
                                    type="number"
                                    value={receivedQuantities[item.id] || ''}
                                    onChange={e => handleQtyChange(item.id, e.target.value)}
                                    max={remaining}
                                    min="0"
                                    className="w-full text-sm p-1 border rounded-md"
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="mt-6 flex justify-end gap-3">
                <Button variant="outline" onClick={onClose} disabled={isSaving}>Cancelar</Button>
                <Button onClick={handleSubmit} disabled={isSaving}>
                    {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Confirmar Recebimento
                </Button>
            </div>
        </Modal>
    );
};

export default ReceivePODialog;