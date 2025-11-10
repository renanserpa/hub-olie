import React, { useState, useEffect } from 'react';
import { Order } from '../../types';
import Modal from '../ui/Modal';
import { Button } from '../ui/Button';
import { toast } from '../../hooks/use-toast';
import { createWaveSchema } from '../../lib/schemas/logistics';
import { Loader2 } from 'lucide-react';

interface CreateWaveDialogProps {
    isOpen: boolean;
    onClose: () => void;
    orders: Order[];
    onConfirm: (orderIds: string[]) => Promise<void>;
}

const CreateWaveDialog: React.FC<CreateWaveDialogProps> = ({ isOpen, onClose, orders, onConfirm }) => {
    const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setSelectedOrderIds([]);
        }
    }, [isOpen]);

    const handleToggleOrder = (orderId: string) => {
        setSelectedOrderIds(prev =>
            prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
        );
    };

    const handleSelectAll = () => {
        if (selectedOrderIds.length === orders.length) {
            setSelectedOrderIds([]);
        } else {
            setSelectedOrderIds(orders.map(o => o.id));
        }
    };

    const handleSubmit = async () => {
        try {
            const validation = createWaveSchema.safeParse({ orderIds: selectedOrderIds });
            if (!validation.success) {
                toast({ title: 'Erro de Validação', description: validation.error.issues[0].message, variant: 'destructive' });
                return;
            }
            setIsSubmitting(true);
            await onConfirm(selectedOrderIds);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Criar Nova Onda de Separação">
            <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b">
                    <label className="flex items-center gap-2 text-sm font-medium">
                        <input
                            type="checkbox"
                            checked={selectedOrderIds.length === orders.length && orders.length > 0}
                            onChange={handleSelectAll}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        Selecionar Todos
                    </label>
                    <span className="text-sm text-textSecondary">{selectedOrderIds.length} de {orders.length} selecionados</span>
                </div>
                <div className="max-h-80 overflow-y-auto space-y-2 pr-2">
                    {orders.map(order => (
                        <label key={order.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent cursor-pointer">
                            <input
                                type="checkbox"
                                checked={selectedOrderIds.includes(order.id)}
                                onChange={() => handleToggleOrder(order.id)}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <div className="flex-1">
                                <p className="font-medium text-sm">{order.number}</p>
                                <p className="text-xs text-textSecondary">{order.customers?.name}</p>
                            </div>
                            <span className="text-xs text-textSecondary">{order.items.reduce((sum, i) => sum + i.quantity, 0)} itens</span>
                        </label>
                    ))}
                </div>
                <div className="mt-6 flex justify-end gap-3 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting || selectedOrderIds.length === 0}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Criar Onda
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default CreateWaveDialog;