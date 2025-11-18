import React, { useState, useEffect, useCallback } from 'react';
import Modal from '../ui/Modal';
import { Button } from '../ui/Button';
import { Contact, AnyContact, ContactStage } from '../../types';
import { Loader2, MapPin } from 'lucide-react';
import { toast } from '../../hooks/use-toast';
import { maskCpfCnpj } from '../../lib/utils';

interface ContactDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: AnyContact | Contact) => Promise<void>;
    contact: Contact | null;
    isSaving: boolean;
}

const stageOptions: { value: ContactStage, label: string }[] = [
    { value: 'Lead', label: 'Lead' },
    { value: 'Cliente Ativo', label: 'Cliente Ativo' },
    { value: 'Contato Geral', label: 'Contato Geral' },
    { value: 'Fornecedor', label: 'Fornecedor' },
    { value: 'Inativo', label: 'Inativo' },
];

const ContactDialog: React.FC<ContactDialogProps> = ({ isOpen, onClose, onSave, contact, isSaving }) => {
    const [formData, setFormData] = useState<Partial<Contact>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCepLoading, setIsCepLoading] = useState(false);

    useEffect(() => {
        if (contact) {
            setFormData(contact);
        } else {
            setFormData({
                name: '', email: '', phone: '', whatsapp: '', instagram: '',
                document: '', birth_date: '',
                stage: 'Lead',
                tags: [],
                address: { zip: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: '' }
            });
        }
    }, [contact, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name.startsWith('address.')) {
            const addressField = name.split('.')[1];
            setFormData(prev => ({ ...prev, address: { ...prev.address, [addressField]: value } }));
        } else if (name === 'document') {
            setFormData(prev => ({ ...prev, [name]: maskCpfCnpj(value) }));
        } else if (name === 'tags') {
            setFormData(prev => ({ ...prev, tags: value.split(',').map(t => t.trim()) }));
        }
        else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleCepLookup = useCallback(async (cep: string) => {
        const onlyNumbers = cep.replace(/\D/g, '');
        if (onlyNumbers.length !== 8) return;

        setIsCepLoading(true);
        try {
            const response = await fetch(`https://viacep.com.br/ws/${onlyNumbers}/json/`);
            if (!response.ok) throw new Error('CEP não encontrado');
            const data = await response.json();
            if (data.erro) throw new Error('CEP inválido');
            
            setFormData(prev => ({
                ...prev,
                address: {
                    ...prev.address,
                    zip: data.cep,
                    street: data.logradouro,
                    neighborhood: data.bairro,
                    city: data.localidade,
                    state: data.uf,
                    complement: data.complemento || prev.address?.complement || ''
                }
            }));

        } catch (error) {
            toast({ title: "Erro na busca de CEP", description: (error as Error).message, variant: 'destructive' });
        } finally {
            setIsCepLoading(false);
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const dataToSave = { ...formData };
        if (dataToSave.tags && !Array.isArray(dataToSave.tags)) {
            // @ts-ignore
            dataToSave.tags = String(dataToSave.tags).split(',').map(tag => tag.trim()).filter(Boolean);
        }
        await onSave(dataToSave as Contact);
        setIsSubmitting(false);
    };

    const inputStyle = "mt-1 w-full px-3 py-2 border border-border rounded-xl shadow-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50";
    const labelStyle = "block text-sm font-medium text-textSecondary";

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={contact ? 'Editar Contato' : 'Novo Contato'}>
            <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                
                <h3 className="text-md font-semibold text-textPrimary border-b pb-2">Dados Pessoais</h3>
                <div>
                    <label className={labelStyle}>Nome Completo *</label>
                    <input name="name" value={formData.name || ''} onChange={handleChange} required className={inputStyle} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelStyle}>Data de Nascimento</label>
                        <input name="birth_date" type="date" value={formData.birth_date || ''} onChange={handleChange} className={inputStyle} />
                    </div>
                    <div>
                        <label className={labelStyle}>CPF/CNPJ</label>
                        <input name="document" value={formData.document || ''} onChange={handleChange} className={inputStyle} />
                    </div>
                </div>

                <h3 className="text-md font-semibold text-textPrimary border-b pb-2 pt-2">Contato</h3>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelStyle}>Email</label>
                        <input name="email" type="email" value={formData.email || ''} onChange={handleChange} className={inputStyle} />
                    </div>
                     <div>
                        <label className={labelStyle}>Telefone</label>
                        <input name="phone" type="tel" value={formData.phone || ''} onChange={handleChange} className={inputStyle} />
                    </div>
                    <div>
                        <label className={labelStyle}>WhatsApp</label>
                        <input name="whatsapp" type="tel" value={formData.whatsapp || ''} onChange={handleChange} className={inputStyle} />
                    </div>
                    <div>
                        <label className={labelStyle}>Instagram</label>
                        <input name="instagram" placeholder="@usuario" value={formData.instagram || ''} onChange={handleChange} className={inputStyle} />
                    </div>
                 </div>

                 <h3 className="text-md font-semibold text-textPrimary border-b pb-2 pt-2">Organização</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelStyle}>Estágio</label>
                        <select name="stage" value={formData.stage || 'Contato Geral'} onChange={handleChange} className={inputStyle}>
                            {stageOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className={labelStyle}>Tags (separadas por vírgula)</label>
                        <input name="tags" value={formData.tags?.join(', ') || ''} onChange={handleChange} className={inputStyle} />
                    </div>
                </div>

                <h3 className="text-md font-semibold text-textPrimary border-b pb-2 pt-2 flex items-center gap-2"><MapPin size={16}/>Endereço</h3>
                 <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1 relative">
                        <label className={labelStyle}>CEP</label>
                        <input name="address.zip" value={formData.address?.zip || ''} onChange={handleChange} onBlur={(e) => handleCepLookup(e.target.value)} className={inputStyle} />
                        {isCepLoading && <Loader2 className="absolute right-2 top-9 h-4 w-4 animate-spin text-primary" />}
                    </div>
                     <div className="col-span-2">
                        <label className={labelStyle}>Logradouro</label>
                        <input name="address.street" value={formData.address?.street || ''} onChange={handleChange} className={inputStyle} />
                    </div>
                 </div>
                 <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1">
                        <label className={labelStyle}>Número *</label>
                        <input name="address.number" value={formData.address?.number || ''} onChange={handleChange} required className={inputStyle} />
                    </div>
                    <div className="col-span-2">
                        <label className={labelStyle}>Complemento</label>
                        <input name="address.complement" value={formData.address?.complement || ''} onChange={handleChange} className={inputStyle} />
                    </div>
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelStyle}>Bairro</label>
                        <input name="address.neighborhood" value={formData.address?.neighborhood || ''} onChange={handleChange} className={inputStyle} />
                    </div>
                    <div>
                        <label className={labelStyle}>Cidade</label>
                        <input name="address.city" value={formData.address?.city || ''} onChange={handleChange} className={inputStyle} />
                    </div>
                 </div>
                 <div className="grid grid-cols-3 gap-4">
                     <div className="col-span-1">
                        <label className={labelStyle}>Estado</label>
                        <input name="address.state" value={formData.address?.state || ''} onChange={handleChange} className={inputStyle} />
                     </div>
                 </div>


                <div className="mt-6 flex justify-end gap-3 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                    <Button type="submit" disabled={isSubmitting || isSaving}>
                        {(isSubmitting || isSaving) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Salvar Contato
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default ContactDialog;