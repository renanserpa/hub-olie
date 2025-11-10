import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { Button } from '../ui/Button';
import { MarketingSegment, MarketingSegmentRule } from '../../types';
import { toast } from '../../hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { segmentSchema } from '../../lib/schemas/marketing';
import RuleBuilder from './RuleBuilder';

interface SegmentDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Omit<MarketingSegment, 'id' | 'audience_size'> | MarketingSegment) => Promise<void>;
    segment: MarketingSegment | null;
}

const SegmentDialog: React.FC<SegmentDialogProps> = ({ isOpen, onClose, onSave, segment }) => {
    const [formData, setFormData] = useState<Partial<Omit<MarketingSegment, 'audience_size'>>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (segment) {
            setFormData(segment);
        } else {
            setFormData({ name: '', description: '', rules: [] });
        }
    }, [segment, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRulesChange = (rules: MarketingSegmentRule[]) => {
        setFormData(prev => ({ ...prev, rules }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        const result = segmentSchema.safeParse(formData);

        if (!result.success) {
            const newErrors: Record<string, string> = {};
            result.error.issues.forEach(err => {
                if (err.path[0]) newErrors[err.path[0].toString()] = err.message;
            });
            setErrors(newErrors);
            toast({ title: "Erro de Validação", description: "Verifique os campos do formulário.", variant: 'destructive'});
            return;
        }
        
        setIsSubmitting(true);
        try {
            const dataToSave = segment 
                ? { ...segment, ...result.data } 
                : result.data;

            await onSave(dataToSave as any);
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputStyle = "mt-1 w-full px-3 py-2 border border-border rounded-xl shadow-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50";
    const labelStyle = "block text-sm font-medium text-textSecondary";

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={segment ? 'Editar Segmento' : 'Novo Segmento'}>
            <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                <div>
                    <label className={labelStyle}>Nome do Segmento *</label>
                    <input name="name" value={formData.name || ''} onChange={handleChange} required className={inputStyle} />
                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>
                <div>
                    <label className={labelStyle}>Descrição</label>
                    <textarea name="description" value={formData.description || ''} onChange={handleChange} rows={2} className={inputStyle} />
                </div>
                
                <div>
                    <label className={labelStyle}>Regras</label>
                    <RuleBuilder rules={formData.rules || []} onChange={handleRulesChange} />
                    {errors.rules && <p className="text-xs text-red-500 mt-1">{errors.rules}</p>}
                </div>

                <div className="mt-6 flex justify-end gap-3 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Salvar Segmento
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default SegmentDialog;