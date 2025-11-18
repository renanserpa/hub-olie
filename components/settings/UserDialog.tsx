import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { Button } from '../ui/Button';
import { UserProfile, UserRole } from '../../types';
import { Loader2, Trash2 } from 'lucide-react';
import { toast } from '../../hooks/use-toast';
import { userSchema } from '../../lib/schemas/user';
import AlertDialog from '../ui/AlertDialog';

interface UserDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Partial<UserProfile> & { password?: string }) => Promise<void>;
    onDelete?: (id: string) => Promise<void>;
    user: UserProfile | null;
    isSaving: boolean;
}

const roleOptions: { value: UserRole, label: string }[] = [
    { value: 'AdminGeral', label: 'Admin Geral' },
    { value: 'Administrativo', label: 'Administrativo' },
    { value: 'Producao', label: 'Produção' },
    { value: 'Vendas', label: 'Vendas' },
    { value: 'Financeiro', label: 'Financeiro' },
    { value: 'Conteudo', label: 'Conteúdo' },
];

const UserDialog: React.FC<UserDialogProps> = ({ isOpen, onClose, onSave, onDelete, user, isSaving }) => {
    const [formData, setFormData] = useState<Partial<UserProfile> & { password?: string }>({});
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData(user);
        } else {
            setFormData({ email: '', role: 'Vendas', password: '' });
        }
        setErrors({});
    }, [user, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        const schemaToUse = user ? userSchema.omit({ password: true }) : userSchema;
        const result = schemaToUse.safeParse(formData);

        if (!result.success) {
            const newErrors: Record<string, string> = {};
            result.error.issues.forEach(err => {
                if (err.path[0]) newErrors[err.path[0].toString()] = err.message;
            });
            setErrors(newErrors);
            toast({ title: "Erro de Validação", description: "Verifique os campos do formulário.", variant: 'destructive' });
            return;
        }

        try {
            await onSave(result.data);
        } catch (e) {
            // Error is handled by the hook
        }
    };

    const handleDeleteClick = () => {
        setIsDeleteAlertOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (user && onDelete) {
            setIsDeleting(true);
            try {
                await onDelete(user.id);
                setIsDeleteAlertOpen(false);
                onClose();
            } finally {
                setIsDeleting(false);
            }
        }
    };

    const inputStyle = "mt-1 w-full px-3 py-2 border border-border rounded-xl shadow-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50";
    const labelStyle = "block text-sm font-medium text-textSecondary";

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} title={user ? 'Editar Usuário' : 'Convidar Novo Usuário'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className={labelStyle}>Email *</label>
                        <input id="email" name="email" type="email" value={formData.email || ''} onChange={handleChange} required className={inputStyle} readOnly={!!user} />
                        {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                    </div>

                    {!user && (
                        <div>
                            <label htmlFor="password" className={labelStyle}>Senha *</label>
                            <input id="password" name="password" type="password" value={formData.password || ''} onChange={handleChange} required className={inputStyle} />
                            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                        </div>
                    )}
                    
                    <div>
                        <label htmlFor="role" className={labelStyle}>Função *</label>
                        <select id="role" name="role" value={formData.role || ''} onChange={handleChange} required className={inputStyle}>
                            {roleOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                        {errors.role && <p className="text-xs text-red-500 mt-1">{errors.role}</p>}
                    </div>

                    <div className="mt-6 flex justify-between items-center pt-4 border-t">
                        {user && onDelete ? (
                            <Button type="button" variant="destructive" onClick={handleDeleteClick} disabled={isSaving || isDeleting}>
                                <Trash2 className="w-4 h-4 mr-2" />
                                Excluir
                            </Button>
                        ) : <div></div>}
                        
                        <div className="flex gap-3">
                            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving || isDeleting}>Cancelar</Button>
                            <Button type="submit" disabled={isSaving || isDeleting}>
                                {(isSaving || isDeleting) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Salvar
                            </Button>
                        </div>
                    </div>
                </form>
            </Modal>

            <AlertDialog
                isOpen={isDeleteAlertOpen}
                onClose={() => setIsDeleteAlertOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Excluir Usuário"
                description={
                    <span>
                        Tem certeza que deseja excluir o usuário <strong>{user?.email}</strong>? Esta ação não pode ser desfeita.
                    </span>
                }
            />
        </>
    );
};

export default UserDialog;