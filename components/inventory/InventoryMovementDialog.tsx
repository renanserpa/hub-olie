import React, { useState, useMemo, useEffect } from 'react';
import Modal from '../ui/Modal';
import { Button } from '../ui/Button';
import { Material, InventoryMovementReason, InventoryMovementType, Warehouse } from '../../types';
import { toast } from '../../hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface InventoryMovementDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => Promise<void>;
    materials: Material[];
    warehouses: Warehouse[];
    isSaving: boolean;
}

const REASON_OPTIONS: { value: InventoryMovementReason, label: string, types: InventoryMovementType[] }[] = [
    { value: 'RECEBIMENTO_PO', label: 'Entrada por Compra', types: ['in'] },
    { value: 'DEVOLUCAO_CLIENTE', label: 'Entrada por Devolução', types: ['in'] },
    { value: 'CONSUMO_PRODUCAO', label: 'Saída para Produção', types: ['out'] },
    { value: 'VENDA_DIRETA', label: 'Saída por Venda', types: ['out'] },
    { value: 'PERDA_AVARIA', label: 'Saída por Perda/Dano', types: ['out'] },
    { value: 'AJUSTE_CONTAGEM', label: 'Ajuste de Contagem', types: ['adjust'] },
    { value: 'TRANSFERENCIA_INTERNA', label: 'Transferência Interna', types: ['transfer'] },
];

const InventoryMovementDialog: React.FC<InventoryMovementDialogProps> = ({ isOpen, onClose, onSave, materials, warehouses, isSaving }) => {
    const [type, setType] = useState<InventoryMovementType>('in');
    const [materialId, setMaterialId] = useState('');
    const [quantity, setQuantity] = useState<number | ''>('');
    const [reason, setReason] = useState<InventoryMovementReason>('RECEBIMENTO_PO');
    const [notes, setNotes] = useState('');
    const [warehouseId, setWarehouseId] = useState('');
    const [fromWarehouseId, setFromWarehouseId] = useState('');
    const [toWarehouseId, setToWarehouseId] = useState('');
    
    const resetForm = () => {
        setType('in');
        setMaterialId('');
        setQuantity('');
        setReason('RECEBIMENTO_PO');
        setNotes('');
        setWarehouseId(warehouses[0]?.id || '');
        setFromWarehouseId(warehouses[0]?.id || '');
        setToWarehouseId(warehouses[1]?.id || '');
    };
    
    useEffect(() => {
        if (isOpen) {
            resetForm();
        }
    }, [isOpen, warehouses]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!materialId || quantity === '') {
            toast({ title: "Atenção", description: "Material e quantidade são obrigatórios.", variant: 'destructive' });
            return;
        }

        let dataToSave: any = { type, material_id: materialId, quantity: Math.abs(Number(quantity)), reason, notes };
        
        if (type === 'transfer') {
            if (!fromWarehouseId || !toWarehouseId || fromWarehouseId === toWarehouseId) {
                toast({ title: "Atenção", description: "Selecione armazéns de origem e destino diferentes.", variant: 'destructive' });
                return;
            }
            dataToSave = { ...dataToSave, from_warehouse_id: fromWarehouseId, to_warehouse_id: toWarehouseId };
        } else {
             if (!warehouseId) {
                toast({ title: "Atenção", description: "Selecione um armazém.", variant: 'destructive' });
                return;
            }
            dataToSave = { ...dataToSave, warehouse_id: warehouseId };
            
            if (type === 'out') {
                dataToSave.quantity = -Math.abs(dataToSave.quantity);
            }
        }
        
        await onSave(dataToSave);
    };

    const reasonOptionsForType = useMemo(() => {
        return REASON_OPTIONS.filter(opt => opt.types.includes(type));
    }, [type]);
    
    useEffect(() => {
        if (!reasonOptionsForType.find(opt => opt.value === reason)) {
            setReason(reasonOptionsForType[0]?.value);
        }
    }, [type, reason, reasonOptionsForType]);
    
    const inputStyle = "mt-1 w-full px-3 py-2 border border-border rounded-xl shadow-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50";
    const labelStyle = "block text-sm font-medium text-textSecondary";

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Registrar Movimento de Estoque">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className={labelStyle}>Material</label>
                    <select value={materialId} onChange={e => setMaterialId(e.target.value)} required className={inputStyle}>
                        <option value="">Selecione um material</option>
                        {materials.map(m => <option key={m.id} value={m.id}>{m.name} ({m.sku})</option>)}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelStyle}>Tipo de Movimento</label>
                         <select value={type} onChange={e => setType(e.target.value as InventoryMovementType)} required className={inputStyle}>
                            <option value="in">Entrada</option>
                            <option value="out">Saída</option>
                            <option value="adjust">Ajuste</option>
                            <option value="transfer">Transferência</option>
                        </select>
                    </div>
                    <div>
                        <label className={labelStyle}>Quantidade</label>
                        <input type="number" step="0.01" value={quantity} onChange={e => setQuantity(e.target.value === '' ? '' : parseFloat(e.target.value))} required className={inputStyle} />
                        <p className="text-xs text-textSecondary mt-1">
                            {type === 'adjust' ? 'Use +/- para ajustar' : 'Use apenas valores positivos'}
                        </p>
                    </div>
                </div>

                {type === 'transfer' ? (
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelStyle}>De (Origem)</label>
                            <select value={fromWarehouseId} onChange={e => setFromWarehouseId(e.target.value)} required className={inputStyle}>
                                {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={labelStyle}>Para (Destino)</label>
                             <select value={toWarehouseId} onChange={e => setToWarehouseId(e.target.value)} required className={inputStyle}>
                                {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                            </select>
                        </div>
                    </div>
                ) : (
                    <div>
                        <label className={labelStyle}>Armazém</label>
                        <select value={warehouseId} onChange={e => setWarehouseId(e.target.value)} required className={inputStyle}>
                            <option value="">Selecione um armazém</option>
                            {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                        </select>
                    </div>
                )}


                 <div>
                    <label className={labelStyle}>Motivo</label>
                     <select value={reason} onChange={e => setReason(e.target.value as InventoryMovementReason)} required className={inputStyle}>
                        {reasonOptionsForType.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                </div>
                
                <div>
                    <label className={labelStyle}>Observações</label>
                    <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className={inputStyle} />
                </div>


                <div className="mt-6 flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>Cancelar</Button>
                    <Button type="submit" disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Salvar Movimento
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default InventoryMovementDialog;