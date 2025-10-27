import React, { useState, useEffect, useCallback } from 'react';
import Modal from '../ui/Modal';
import { Button } from '../ui/Button';
import { Contact, AnyContact } from '../../types';
import { Loader2, MapPin } from 'lucide-react';
import { toast } from '../../hooks/use-toast';
import { maskCpfCnpj } from '../../lib/utils';

interface ContactDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: AnyContact | Contact) => Promise<void>;
    contact: Contact | null;
}

const ContactDialog: React.FC<ContactDialogProps> = ({ isOpen, onClose, onSave, contact }) => {
    const [formData, setFormData] = useState<Partial<Contact>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCepLoading, setIsCepLoading] = useState(false);

    useEffect(() => {
        if (contact) {
            setFormData(contact);
        } else {
            setFormData({
                name: '', email: '', phone: '', whatsapp: '', instagram: '',
                cpf_cnpj: '', birth_date: '',
                address: { zip: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: '' }
            });
        }
    }, [contact, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name.startsWith('address.')) {
            const addressField = name.split('.')[1];
            setFormData(prev => ({ ...prev, address: { ...prev.address, [addressField]: value } }));
        } else if (name === 'cpf_cnpj') {
            setFormData(prev => ({ ...prev, [name]: maskCpfCnpj(value) }));
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
            toast({ title: "Erro no CEP", description: (error as Error).message, variant: 'destructive' });
        } finally {
            setIsCepLoading(false);
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        await onSave(formData as Contact);
        setIsSubmitting(false);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={contact ? 'Editar Contato' : 'Novo Contato'}>
            <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                
                <h3 className="text-md font-semibold text-textPrimary border-b pb-2">Dados Pessoais</h3>
                <div>
                    <label>Nome Completo *</label>
                    <input name="name" value={formData.name || ''} onChange={handleChange} required className="w-full input-style" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label>Data de Nascimento</label>
                        <input name="birth_date" type="date" value={formData.birth_date || ''} onChange={handleChange} className="w-full input-style" />
                    </div>
                    <div>
                        <label>CPF/CNPJ</label>
                        <input name="cpf_cnpj" value={formData.cpf_cnpj || ''} onChange={handleChange} className="w-full input-style" />
                    </div>
                </div>

                <h3 className="text-md font-semibold text-textPrimary border-b pb-2 pt-2">Contato</h3>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label>Email</label>
                        <input name="email" type="email" value={formData.email || ''} onChange={handleChange} className="w-full input-style" />
                    </div>
                     <div>
                        <label>Telefone</label>
                        <input name="phone" type="tel" value={formData.phone || ''} onChange={handleChange} className="w-full input-style" />
                    </div>
                    <div>
                        <label>WhatsApp</label>
                        <input name="whatsapp" type="tel" value={formData.whatsapp || ''} onChange={handleChange} className="w-full input-style" />
                    </div>
                    <div>
                        <label>Instagram</label>
                        <input name="instagram" placeholder="@usuario" value={formData.instagram || ''} onChange={handleChange} className="w-full input-style" />
                    </div>
                 </div>

                <h3 className="text-md font-semibold text-textPrimary border-b pb-2 pt-2 flex items-center gap-2"><MapPin size={16}/>Endereço</h3>
                 <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1 relative">
                        <label>CEP</label>
                        <input name="address.zip" value={formData.address?.zip || ''} onChange={handleChange} onBlur={(e) => handleCepLookup(e.target.value)} className="w-full input-style" />
                        {isCepLoading && <Loader2 className="absolute right-2 top-9 h-4 w-4 animate-spin text-primary" />}
                    </div>
                     <div className="col-span-2">
                        <label>Logradouro</label>
                        <input name="address.street" value={formData.address?.street || ''} onChange={handleChange} className="w-full input-style" />
                    </div>
                 </div>
                 <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1">
                        <label>Número *</label>
                        <input name="address.number" value={formData.address?.number || ''} onChange={handleChange} required className="w-full input-style" />
                    </div>
                    <div className="col-span-2">
                        <label>Complemento</label>
                        <input name="address.complement" value={formData.address?.complement || ''} onChange={handleChange} className="w-full input-style" />
                    </div>
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label>Bairro</label>
                        <input name="address.neighborhood" value={formData.address?.neighborhood || ''} onChange={handleChange} className="w-full input-style" />
                    </div>
                    <div>
                        <label>Cidade</label>
                        <input name="address.city" value={formData.address?.city || ''} onChange={handleChange} className="w-full input-style" />
                    </div>
                 </div>

                <div className="mt-6 flex justify-end gap-3 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Salvar Contato
                    </Button>
                </div>
            </form>
             <style jsx>{`
                .input-style {
                    margin-top: 0.25rem;
                    padding: 0.5rem 0.75rem;
                    border: 1px solid var(--border-color, #EAE7E1);
                    border-radius: 0.75rem;
                    box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05);
                    background-color: var(--background-color, #FCFAF8);
                }
                .input-style:focus {
                    outline: none;
                    box-shadow: 0 0 0 2px var(--primary-color-focus, rgba(210, 166, 109, 0.5));
                }
                label {
                     display: block;
                     font-size: 0.875rem;
                     font-weight: 500;
                     color: var(--text-secondary-color, #6B6B6B);
                }
            `}</style>
        </Modal>
    );
};

export default ContactDialog;
