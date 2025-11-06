import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { Button } from '../ui/Button';
import { Supplier, Material, PurchaseOrderItem } from '../../types';
import { toast } from '../../hooks/use-toast';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { createPOSchema } from '../../lib/schemas/po';
import { poItemSchema } from '../../lib/schemas/poItem';

interface CreatePODialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: { supplier_id: string, items: Omit<PurchaseOrderItem, 'id' | 'po_id'>[] }) => Promise<void>;
    suppliers: Supplier[];
    materials: Material[];
    isSaving: boolean;
}

type NewPOItem = Partial<Omit<PurchaseOrderItem, 'id' | 'po_id'>>;

const CreatePODialog: React.FC<CreatePODialogProps> = ({ isOpen, onClose, onSave, suppliers, materials, isSaving }) => {
    const [supplierId, setSupplierId] = useState('');
    const [items, setItems] = useState<NewPOItem[]>([{ material_id: '', quantity: 1, unit_price: 0 }]);

    useEffect(() => {
        if (!isOpen) {
            setSupplierId('');
            setItems([{ material_id: '', quantity: 1, unit_price: 0 }]);
        }
    }, [isOpen]);

    const handleItemChange = (index: number, field: keyof NewPOItem, value: any) => {
        const newItems = [...items];
        const item = newItems[index];
        
        if (field === 'material_id') {
            const material = materials.find(m => m.id === value);
            item.material_id = value;
        } else if (field === 'quantity' || field === 'unit_price') {
            (item as any)[field] = parseFloat(value) || 0;
        }

        item.total = (item.quantity || 0) * (item.unit_price || 0);
        setItems(newItems);
    };

    const addItem = () => {
        setItems([...items, { material_id: '', quantity: 1, unit_price: 0, total: 0 }]);
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const totalPO = items.reduce((sum, item) => sum + (item.total || 0), 0);

    const handleSubmit = async () => {
        const poValidation = createPOSchema.safeParse({ supplier_id: supplierId });
        if (!poValidation.success) {
            // FIX: Use `poValidation.error.issues` instead of `poValidation.error.errors`.
            toast({ title: 'Erro', description: poValidation.error.issues[0].message, variant: 'destructive' });
            return;
        }

        const validatedItems = items.map(item => poItemSchema.safeParse(item));
        const firstError = validatedItems.find(res => !res.success);
        if (firstError && !firstError.success) {
            // FIX: Use `firstError.error.issues` instead of `firstError.error.errors`.
            toast({ title: 'Erro nos Itens', description: firstError.error.issues[0].message, variant: 'destructive' });
            return;
        }

        const finalItems = validatedItems.map(res => (res as any).data);
        await onSave({ supplier_id: supplierId, items: finalItems });
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Novo Pedido de Compra">
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                <div>
                    <label className="block text-sm font-medium text-textSecondary">Fornecedor</label>
                    <select value={supplierId} onChange={e => setSupplierId(e.target.value)} className="mt-1 w-full p-2 border rounded-md">
                        <option value="">Selecione um fornecedor</option>
                        {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>

                <div>
                    <h3 className="text-md font-semibold mb-2">Itens</h3>
                    <div className="space-y-2">
                        {items.map((item, index) => (
                            <div key={index} className="grid grid-cols-12 gap-2 items-end p-2 border rounded-lg bg-secondary/50">
                                <div className="col-span-5">
                                    <label className="text-xs">Material</label>
                                    <select value={item.material_id} onChange={e => handleItemChange(index, 'material_id', e.target.value)} className="w-full text-sm p-1 border rounded-md">
                                        <option value="">Selecione</option>
                                        {materials.map(m => <option key={m.id} value={m.id}>{m.name} ({m.sku})</option>)}
                                    </select>
                                </div>
                                <div className="col-span-2">
                                    <label className="text-xs">Qtd</label>
                                    <input type="number" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', e.target.value)} className="w-full text-sm p-1 border rounded-md" />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-xs">Preço Unit.</label>
                                    <input type="number" step="0.01" value={item.unit_price} onChange={e => handleItemChange(index, 'unit_price', e.target.value)} className="w-full text-sm p-1 border rounded-md" />
                                </div>
                                <div className="col-span-2 text-right">
                                    <p className="text-xs text-textSecondary">Total</p>
                                    <p className="text-sm font-medium">R$ {item.total?.toFixed(2) || '0.00'}</p>
                                </div>
                                <div className="col-span-1">
                                    <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(index)}><Trash2 size={14} /></Button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <Button type="button" variant="outline" size="sm" className="mt-2" onClick={addItem}><Plus className="w-3 h-3 mr-2" />Adicionar Item</Button>
                </div>
                 <div className="text-right border-t pt-4">
                    <p className="text-sm text-textSecondary">Total do Pedido</p>
                    <p className="font-bold text-2xl text-primary">R$ {totalPO.toFixed(2)}</p>
                 </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
                <Button variant="outline" onClick={onClose} disabled={isSaving}>Cancelar</Button>
                <Button onClick={handleSubmit} disabled={isSaving}>
                    {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Criar Pedido
                </Button>
            </div>
        </Modal>
    );
};

export default CreatePODialog;