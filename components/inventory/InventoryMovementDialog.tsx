import React, { useState, useMemo } from 'react';
import Modal from '../ui/Modal';
import { Button } from '../ui/Button';
import { BasicMaterial, InventoryMovementReason, InventoryMovementType } from '../../types';
import { toast } from '../../hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface InventoryMovementDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => Promise<void>;
    materials: BasicMaterial[];
}

const REASON_OPTIONS: { value: InventoryMovementReason, label: string, types: InventoryMovementType[] }[] = [
    { value: 'compra', label: 'Entrada por Compra', types: ['in'] },
    { value: 'devolucao', label: 'Entrada por Devolução', types: ['in'] },
    { value: 'consumo_producao', label: 'Saída para Produção', types: ['out'] },
    { value: 'venda', label: 'Saída por Venda', types: ['out'] },
    { value: 'perda', label: 'Saída por Perda/Dano', types: ['out'] },
    { value: 'contagem', label: 'Ajuste de Contagem', types: ['adjustment'] },
];

const InventoryMovementDialog: React.FC<InventoryMovementDialogProps> = ({ isOpen, onClose, onSave, materials }) => {
    const [materialId, setMaterialId] = useState('');
    const [type, setType] = useState<InventoryMovementType>('in');
    const [quantity, setQuantity] = useState<number | ''>('');
    const [reason, setReason] = useState<InventoryMovementReason>('compra');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const resetForm = () => {
        setMaterialId('');
        setType('in');
        setQuantity('');
        setReason('compra');
        setNotes('');
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!materialId || quantity === '' || (type !== 'adjustment' && quantity <= 0)) {
            toast({ title: "Atenção", description: "Preencha todos os campos obrigatórios e a quantidade deve ser positiva.", variant: 'destructive' });
            return;
        }

        setIsSubmitting(true);
        try {
            let finalQuantity = Number(quantity);
            if(type === 'out') finalQuantity = -Math.abs(finalQuantity);
            
            await onSave({
                material_id: materialId,
                type,
                quantity: finalQuantity,
                reason,
                notes,
            });
            handleClose();
        } finally {
            setIsSubmitting(false);
        }
    };

    const reasonOptionsForType = useMemo(() => {
        return REASON_OPTIONS.filter(opt => opt.types.includes(type));
    }, [type]);
    
    // Auto-select first valid reason when type changes
    React.useEffect(() => {
        if (!reasonOptionsForType.find(opt => opt.value === reason)) {
            setReason(reasonOptionsForType[0].value);
        }
    }, [type, reason, reasonOptionsForType]);

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Registrar Movimento de Estoque">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-textSecondary">Material</label>
                    <select value={materialId} onChange={e => setMaterialId(e.target.value)} required className="mt-1 w-full px-3 py-2 border border-border rounded-xl shadow-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50">
                        <option value="">Selecione um material</option>
                        {materials.map(m => <option key={m.id} value={m.id}>{m.name} ({m.codigo})</option>)}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-textSecondary">Tipo de Movimento</label>
                         <select value={type} onChange={e => setType(e.target.value as InventoryMovementType)} required className="mt-1 w-full px-3 py-2 border border-border rounded-xl shadow-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50">
                            <option value="in">Entrada</option>
                            <option value="out">Saída</option>
                            <option value="adjustment">Ajuste</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-textSecondary">Quantidade</label>
                        <input type="number" step="0.01" value={quantity} onChange={e => setQuantity(e.target.value === '' ? '' : parseFloat(e.target.value))} required className="mt-1 w-full px-3 py-2 border border-border rounded-xl shadow-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50" />
                         {type !== 'adjustment' && <p className="text-xs text-textSecondary mt-1">Use apenas valores positivos.</p>}
                         {type === 'adjustment' && <p className="text-xs text-textSecondary mt-1">Use valores negativos para saídas.</p>}
                    </div>
                </div>

                 <div>
                    <label className="block text-sm font-medium text-textSecondary">Motivo</label>
                     <select value={reason} onChange={e => setReason(e.target.value as InventoryMovementReason)} required className="mt-1 w-full px-3 py-2 border border-border rounded-xl shadow-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50">
                        {reasonOptionsForType.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-textSecondary">Observações</label>
                    <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="mt-1 w-full px-3 py-2 border border-border rounded-xl shadow-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>


                <div className="mt-6 flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={handleClose}>Cancelar</Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Salvar Movimento
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default InventoryMovementDialog;