import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { Button } from '../ui/Button';
import { MarketingCampaign, MarketingSegment, MarketingTemplate, MarketingChannel, MarketingCampaignStatus } from '../../types';
import { toast } from '../../hooks/use-toast';
import { Loader2, Sparkles } from 'lucide-react';
import { campaignSchema } from '../../lib/schemas/marketing';
import { geminiService } from '../../services/geminiService';

interface CampaignDialogProps {
    isOpen: boolean;
    onClose: () => void;
    // FIX: Correct the type for `onSave` to match the hook's `saveCampaign` parameter, which expects an object without system-managed fields for creation.
    onSave: (data: Omit<MarketingCampaign, 'id' | 'created_at' | 'updated_at' | 'spent' | 'kpis'> | MarketingCampaign) => Promise<void>;
    campaign: MarketingCampaign | null;
    segments: MarketingSegment[];
    templates: MarketingTemplate[];
}

const statusOptions: { value: MarketingCampaignStatus, label: string }[] = [
    { value: 'draft', label: 'Rascunho' }, { value: 'scheduled', label: 'Agendada' }, { value: 'active', label: 'Ativa' },
    { value: 'paused', label: 'Pausada' }, { value: 'completed', label: 'Concluída' }, { value: 'cancelled', label: 'Cancelada' }
];
const channelOptions: { value: MarketingChannel, label: string }[] = [
    { value: 'email', label: 'Email' }, { value: 'sms', label: 'SMS' }, { value: 'whatsapp', label: 'WhatsApp' }, { value: 'instagram', label: 'Instagram' }
];

const CampaignDialog: React.FC<CampaignDialogProps> = ({ isOpen, onClose, onSave, campaign, segments, templates }) => {
    const [formData, setFormData] = useState<Partial<Omit<MarketingCampaign, 'kpis' | 'spent'>>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAiLoading, setIsAiLoading] = useState(false);

    useEffect(() => {
        if (campaign) {
            setFormData(campaign);
        } else {
            setFormData({
                name: '', description: '', status: 'draft', channels: [], budget: 0,
            });
        }
    }, [campaign, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleChannelChange = (channel: MarketingChannel) => {
        const currentChannels = formData.channels || [];
        const newChannels = currentChannels.includes(channel)
            ? currentChannels.filter(c => c !== channel)
            : [...currentChannels, channel];
        setFormData(prev => ({ ...prev, channels: newChannels }));
    };

    const handleGenerateDescription = async () => {
        if (!formData.name) {
            toast({ title: 'Atenção', description: 'Preencha o nome da campanha para gerar uma descrição.', variant: 'destructive' });
            return;
        }
        setIsAiLoading(true);
        try {
            const objective = "Descreva o objetivo principal da campanha aqui."; // Placeholder
            const description = await geminiService.generateCampaignDescription(formData.name, objective);
            setFormData(prev => ({ ...prev, description }));
            toast({ title: 'Sucesso!', description: 'Descrição gerada pela IA.' });
        } catch(e) {
            toast({ title: 'Erro de IA', description: (e as Error).message, variant: 'destructive' });
        } finally {
            setIsAiLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        const dataToValidate = {
            ...formData,
            budget: Number(formData.budget || 0),
        };

        const result = campaignSchema.safeParse(dataToValidate);

        if (!result.success) {
            const newErrors: Record<string, string> = {};
            result.error.issues.forEach(err => {
                // FIX: Convert path segment to string to use as a record key, resolving "Type 'symbol' cannot be used as an index type" error.
                if (err.path[0]) newErrors[err.path[0].toString()] = err.message;
            });
            setErrors(newErrors);
            toast({ title: "Erro de Validação", description: "Verifique os campos do formulário.", variant: 'destructive'});
            return;
        }
        
        setIsSubmitting(true);
        try {
            const dataToSave = campaign 
                ? { ...campaign, ...result.data } 
                : result.data;

            // FIX: The type of dataToSave now correctly matches the updated onSave prop type.
            await onSave(dataToSave as any);
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputStyle = "mt-1 w-full px-3 py-2 border border-border rounded-xl shadow-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50";
    const labelStyle = "block text-sm font-medium text-textSecondary";

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={campaign ? 'Editar Campanha' : 'Nova Campanha'}>
            <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                <div>
                    <label className={labelStyle}>Nome da Campanha *</label>
                    <input name="name" value={formData.name || ''} onChange={handleChange} required className={inputStyle} />
                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>
                <div>
                    <label className={labelStyle}>Descrição</label>
                    <textarea name="description" value={formData.description || ''} onChange={handleChange} rows={3} className={inputStyle} />
                    <Button type="button" variant="ghost" size="sm" className="mt-1 text-primary" onClick={handleGenerateDescription} disabled={isAiLoading}>
                        {isAiLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles className="mr-2 h-4 w-4"/>}
                        Gerar com IA
                    </Button>
                </div>
                <div>
                    <label className={labelStyle}>Canais *</label>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {channelOptions.map(opt => (
                            <label key={opt.value} className="flex items-center gap-2 px-3 py-1.5 border rounded-full text-sm cursor-pointer transition-colors"
                                style={{ backgroundColor: formData.channels?.includes(opt.value) ? 'var(--color-accent)' : 'transparent' }}>
                                <input type="checkbox" checked={formData.channels?.includes(opt.value)} onChange={() => handleChannelChange(opt.value)} className="hidden"/>
                                {opt.label}
                            </label>
                        ))}
                    </div>
                     {errors.channels && <p className="text-xs text-red-500 mt-1">{errors.channels}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className={labelStyle}>Status</label>
                        <select name="status" value={formData.status || 'draft'} onChange={handleChange} className={inputStyle}>
                            {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className={labelStyle}>Agendar Para</label>
                        <input name="scheduled_at" type="datetime-local" value={formData.scheduled_at ? new Date(new Date(formData.scheduled_at).getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0,16) : ''} onChange={handleChange} className={inputStyle}/>
                    </div>
                </div>
                 <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className={labelStyle}>Segmento</label>
                        <select name="segment_id" value={formData.segment_id || ''} onChange={handleChange} className={inputStyle}>
                            <option value="">Todos os Clientes</option>
                            {segments.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className={labelStyle}>Template</label>
                         <select name="template_id" value={formData.template_id || ''} onChange={handleChange} className={inputStyle}>
                            <option value="">Nenhum</option>
                            {templates.map(t => <option key={t.id} value={t.id}>{t.name} ({t.channel})</option>)}
                        </select>
                    </div>
                </div>
                <div>
                    <label className={labelStyle}>Orçamento (R$)</label>
                    <input name="budget" type="number" step="0.01" value={formData.budget || ''} onChange={handleChange} required className={inputStyle} />
                    {errors.budget && <p className="text-xs text-red-500 mt-1">{errors.budget}</p>}
                </div>
                <div className="mt-6 flex justify-end gap-3 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Salvar Campanha
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default CampaignDialog;
