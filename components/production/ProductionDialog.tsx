import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { Button } from '../ui/Button';
import { Product, ProductionOrder, ProductionOrderPriority } from '../../types';
import { Loader2 } from 'lucide-react';
import { toast } from '../../hooks/use-toast';

interface ProductionDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Partial<Omit<ProductionOrder, 'id'>>) => Promise<void>;
    products: Product[];
    isSaving: boolean;
}

const ProductionDialog: React.FC<ProductionDialogProps> = ({ isOpen, onClose, onSave, products, isSaving }) => {
    const [formData, setFormData] = useState<Partial<ProductionOrder>>({});

    useEffect(() => {
        if (isOpen) {
            setFormData({
                product_id: '',
                quantity: 1,
                priority: 'normal',
                due_date: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10), // 7 days from now
            });
        }
    }, [isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.product_id || !formData.quantity || formData.quantity <= 0) {
            toast({ title: "Atenção", description: "Selecione um produto e uma quantidade válida.", variant: 'destructive' });
            return;
        }
        await onSave(formData);
    };
    
    const inputStyle = "mt-1 w-full px-3 py-2 border border-border rounded-xl shadow-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50";
    const labelStyle = "block text-sm font-medium text-textSecondary";

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Nova Ordem de Produção Manual">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className={labelStyle}>Produto *</label>
                    <select name="product_id" value={formData.product_id} onChange={handleChange} required className={inputStyle}>
                        <option value="">Selecione um produto</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelStyle}>Quantidade *</label>
                        <input name="quantity" type="number" value={formData.quantity} min="1" onChange={handleChange} required className={inputStyle} />
                    </div>
                    <div>
                        <label className={labelStyle}>Prioridade</label>
                        <select name="priority" value={formData.priority} onChange={handleChange} className={inputStyle}>
                            <option value="baixa">Baixa</option>
                            <option value="normal">Normal</option>
                            <option value="alta">Alta</option>
                            <option value="urgente">Urgente</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className={labelStyle}>Prazo de Entrega</label>
                    <input name="due_date" type="date" value={formData.due_date} onChange={handleChange} required className={inputStyle} />
                </div>
                
                <div className="mt-6 flex justify-end gap-3 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>Cancelar</Button>
                    <Button type="submit" disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Criar OP
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default ProductionDialog;