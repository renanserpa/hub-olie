import React, { useState, useEffect, useCallback } from 'react';
import Modal from '../ui/Modal';
import { Button } from '../ui/Button';
import { Supplier } from '../../types';
import { Loader2, MapPin } from 'lucide-react';
import { toast } from '../../hooks/use-toast';
import { maskCpfCnpj } from '../../lib/utils';
import { supplierSchema } from '../../lib/schemas/supplier';

interface SupplierDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Omit<Supplier, 'id' | 'created_at' | 'updated_at'> | Supplier) => Promise<void>;
    supplier: Supplier | null;
    isSaving: boolean;
}

const SupplierDialog: React.FC<SupplierDialogProps> = ({ isOpen, onClose, onSave, supplier, isSaving }) => {
    const [formData, setFormData] = useState<Partial<Supplier>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (supplier) {
            setFormData(supplier);
        } else {
            setFormData({
                name: '', document: '', email: '', phone: '',
                payment_terms: '30D', lead_time_days: 0, rating: 5, is_active: true, notes: ''
            });
        }
    }, [supplier, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setFormData(prev => ({...prev, [name]: checked }));
        } else if (name === 'document') {
            setFormData(prev => ({ ...prev, [name]: maskCpfCnpj(value) }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        const result = supplierSchema.safeParse(formData);
        if (!result.success) {
            const newErrors: Record<string, string> = {};
            result.error.issues.forEach(err => {
                // FIX: Convert path segment to string to use as a record key, resolving "Type 'symbol' cannot be used as an index type" error.
                if(err.path[0]) newErrors[err.path[0].toString()] = err.message;
            });
            setErrors(newErrors);
            toast({ title: "Erro de Validação", description: "Verifique os campos do formulário.", variant: 'destructive'});
            return;
        }

        try {
            const dataToSave = supplier ? { ...supplier, ...result.data } : result.data;
            await onSave(dataToSave as any);
        } catch(e) {
            // Error already toasted in hook
        }
    };

    const inputStyle = "mt-1 w-full px-3 py-2 border border-border rounded-xl shadow-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50";
    const labelStyle = "block text-sm font-medium text-textSecondary";

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={supplier ? 'Editar Fornecedor' : 'Novo Fornecedor'}>
            <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                
                <div>
                    <label className={labelStyle}>Nome *</label>
                    <input name="name" value={formData.name || ''} onChange={handleChange} required className={inputStyle} />
                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>

                 <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className={labelStyle}>CNPJ / CPF</label>
                        <input name="document" value={formData.document || ''} onChange={handleChange} className={inputStyle} />
                        {errors.document && <p className="text-xs text-red-500 mt-1">{errors.document}</p>}
                    </div>
                     <div>
                        <label className={labelStyle}>Email</label>
                        <input name="email" type="email" value={formData.email || ''} onChange={handleChange} className={inputStyle} />
                        {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className={labelStyle}>Telefone</label>
                        <input name="phone" type="tel" value={formData.phone || ''} onChange={handleChange} className={inputStyle} />
                    </div>
                     <div>
                        <label className={labelStyle}>Condições de Pagamento</label>
                        <select name="payment_terms" value={formData.payment_terms} onChange={handleChange} className={inputStyle}>
                            <option value="à vista">À vista</option>
                            <option value="15D">15 dias</option>
                            <option value="30D">30 dias</option>
                            <option value="45D">45 dias</option>
                            <option value="60D">60 dias</option>
                        </select>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className={labelStyle}>Lead Time (dias)</label>
                        <input name="lead_time_days" type="number" value={formData.lead_time_days ?? ''} onChange={handleChange} className={inputStyle} />
                         {errors.lead_time_days && <p className="text-xs text-red-500 mt-1">{errors.lead_time_days}</p>}
                    </div>
                     <div>
                        <label className={labelStyle}>Rating (1-5)</label>
                        <input name="rating" type="number" min="1" max="5" value={formData.rating ?? ''} onChange={handleChange} className={inputStyle} />
                         {errors.rating && <p className="text-xs text-red-500 mt-1">{errors.rating}</p>}
                    </div>
                 </div>

                <div>
                    <label className={labelStyle}>Observações</label>
                    <textarea name="notes" value={formData.notes || ''} onChange={handleChange} rows={3} className={inputStyle} />
                </div>
                
                 <div>
                    <label className="flex items-center gap-2 text-sm text-textPrimary cursor-pointer">
                        <input 
                            type="checkbox" 
                            name="is_active"
                            checked={!!formData.is_active} 
                            onChange={handleChange}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        Fornecedor Ativo
                    </label>
                </div>


                <div className="mt-6 flex justify-end gap-3 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>Cancelar</Button>
                    <Button type="submit" disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Salvar
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default SupplierDialog;