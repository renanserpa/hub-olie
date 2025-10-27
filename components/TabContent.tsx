
import React, { useState } from 'react';
import { AnyItem, SettingsCategory, FieldConfig } from '../types';
import { Pencil, Trash2, Plus, Sparkles, Loader2, PackageOpen } from 'lucide-react';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { IconButton } from './ui/IconButton';
import Modal from './ui/Modal';
import AlertDialog from './ui/AlertDialog';
import { geminiService } from '../services/geminiService';
import { cn } from '../lib/utils';


interface TabContentProps {
  category: SettingsCategory;
  data: AnyItem[];
  fields: FieldConfig[];
  onAdd: (category: SettingsCategory, item: Omit<AnyItem, 'id'>) => Promise<void>;
  onUpdate: (category: SettingsCategory, item: AnyItem) => Promise<void>;
  onDelete: (category: SettingsCategory, itemId: string) => Promise<void>;
  isAdmin: boolean;
  title: string;
}

const TabContent: React.FC<TabContentProps> = ({ category, data, fields, onAdd, onUpdate, onDelete, isAdmin, title }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<AnyItem | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAiHighlight, setIsAiHighlight] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  
  const openModal = (item: AnyItem | null = null) => {
    setCurrentItem(item);
    setFormData(item ? { ...item } : fields.reduce((acc, field) => ({ ...acc, [field.key]: field.type === 'checkbox' ? false : '' }), {}));
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentItem(null);
    setFormData({});
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target;
    const name = target.name;
    if (target instanceof HTMLInputElement && target.type === 'checkbox') {
        setFormData(prev => ({ ...prev, [name]: target.checked }));
    } else {
        setFormData(prev => ({ ...prev, [name]: target.value }));
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
        if (currentItem) {
          await onUpdate(category, formData as AnyItem);
        } else {
          await onAdd(category, formData as Omit<AnyItem, 'id'>);
        }
        closeModal();
    } catch (error) {
        // Error toast is handled by the parent `App.tsx` component
        console.error("Submission failed", error);
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const handleDelete = (itemId: string) => {
    setDeleteItemId(itemId);
  };

  const confirmDelete = async () => {
    if (deleteItemId) {
        await onDelete(category, deleteItemId);
        setDeleteItemId(null);
    }
  }

  const handleGenerateDescription = async () => {
    if (!formData.name) {
        alert('Por favor, preencha o campo "Nome" primeiro.');
        return;
    }
    setIsAiLoading(true);
    try {
        const newDescription = await geminiService.generateDescription(formData.name, formData.description);
        setFormData(prev => ({ ...prev, description: newDescription }));
        setIsAiHighlight(true);
        setTimeout(() => setIsAiHighlight(false), 1500);
    } catch (error) {
        console.error(error);
        alert((error as Error).message);
    } finally {
        setIsAiLoading(false);
    }
  };

  return (
    <div className="p-0">
      <div className="flex justify-between items-center mb-6 pt-6">
        <h2 className="text-2xl font-bold text-textPrimary">{title}</h2>
        {isAdmin && (
          <Button onClick={() => openModal()}>
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Novo
          </Button>
        )}
      </div>

      {data.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary">
              <tr>
                {fields.map(field => field.key !== 'id' && <th key={field.key} className="p-4 font-semibold text-textSecondary">{field.label}</th>)}
                {isAdmin && <th className="p-4 font-semibold text-textSecondary text-right">Ações</th>}
              </tr>
            </thead>
            <tbody>
              {data.map(item => (
                <tr key={item.id} className="border-b border-border hover:bg-accent/50">
                  {fields.map(field => field.key !== 'id' && (
                    <td key={field.key} className="p-4 text-textPrimary">
                      {field.type === 'color' ? (
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 rounded-full border" style={{ backgroundColor: item[field.key as keyof AnyItem] as string }}></div>
                          <span>{item[field.key as keyof AnyItem] as string}</span>
                        </div>
                      ) : field.type === 'checkbox' ? (
                         <Badge variant={item[field.key as keyof AnyItem] ? 'ativo' : 'inativo'}>
                             {item[field.key as keyof AnyItem] ? 'Ativo' : 'Inativo'}
                         </Badge>
                      ) : (
                        String(item[field.key as keyof AnyItem] ?? '')
                      )}
                    </td>
                  ))}
                  {isAdmin && (
                    <td className="p-4 text-right">
                      <div className="flex justify-end items-center gap-1">
                          <IconButton onClick={() => openModal(item)}><Pencil size={16} /></IconButton>
                          <IconButton onClick={() => handleDelete(item.id)} className="hover:text-red-600"><Trash2 size={16} /></IconButton>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
         <div className="text-center text-textSecondary py-16 border-2 border-dashed border-border rounded-xl">
            <PackageOpen className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-textPrimary">Nenhum item encontrado</h3>
            <p className="mt-1 text-sm text-textSecondary">Comece adicionando um novo item para esta categoria.</p>
            {isAdmin && (
                <div className="mt-6">
                    <Button onClick={() => openModal()}>
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Novo
                    </Button>
                </div>
            )}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={closeModal} title={currentItem ? `Editar: ${currentItem.name}` : `Adicionar Novo Item`}>
        <form onSubmit={handleSubmit}>
            <div className="space-y-4">
            {fields.map(field => field.key !== 'id' && (
                <div key={field.key}>
                    <div className="flex justify-between items-center mb-1">
                        <label htmlFor={field.key} className="block text-sm font-medium text-textSecondary">{field.label}</label>
                        {field.key === 'description' && category === 'logistica' && (
                           <Button 
                                type="button" 
                                variant="outline" 
                                size="sm"
                                onClick={handleGenerateDescription}
                                disabled={isAiLoading}
                                className="text-xs px-2 py-1 h-auto"
                            >
                               {isAiLoading ? (
                                   <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                               ) : (
                                   <Sparkles className="w-3 h-3 mr-2" />
                               )}
                               Melhorar com IA
                           </Button>
                        )}
                    </div>

                    {field.type === 'checkbox' ? (
                         <label className="flex items-center gap-2 text-sm text-textPrimary cursor-pointer">
                            <input 
                                type="checkbox" 
                                id={field.key} 
                                name={field.key}
                                checked={!!formData[field.key]} 
                                onChange={handleInputChange}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            {formData[field.key] ? 'Ativo' : 'Inativo'}
                         </label>
                    ) : field.type === 'textarea' ? (
                        <textarea
                            id={field.key}
                            name={field.key}
                            value={formData[field.key] || ''}
                            onChange={handleInputChange}
                            rows={4}
                            className={cn(
                                "w-full px-3 py-2 border border-border rounded-xl shadow-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50",
                                isAiHighlight && "animate-highlight-fade"
                            )}
                        />
                    ) : (
                        <input
                            type={field.type}
                            id={field.key}
                            name={field.key}
                            value={formData[field.key] || ''}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-border rounded-xl shadow-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                            required={field.key === 'name'}
                        />
                    )}
                </div>
            ))}
            </div>
          <div className="mt-6 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={closeModal} disabled={isSubmitting}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar
            </Button>
          </div>
        </form>
      </Modal>

      <AlertDialog
        isOpen={!!deleteItemId}
        onClose={() => setDeleteItemId(null)}
        onConfirm={confirmDelete}
        title="Confirmar Exclusão"
        description="Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita."
      />
    </div>
  );
};

export default TabContent;
