import React, { useState } from 'react';
import { AnySettingsItem, SettingsCategory, FieldConfig } from '../types';
import { Pencil, Trash2, Plus, Loader2, PackageOpen } from 'lucide-react';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { IconButton } from './ui/IconButton';
import Modal from './ui/Modal';
import AlertDialog from './ui/AlertDialog';
import { cn } from '../lib/utils';
import { toast } from '../hooks/use-toast';

interface TabContentProps {
  category: SettingsCategory;
  data: AnySettingsItem[];
  fields: FieldConfig[];
  onAdd: (item: Omit<AnySettingsItem, 'id'>, fileData?: Record<string, File | null>) => Promise<void>;
  onUpdate: (item: AnySettingsItem, fileData?: Record<string, File | null>) => Promise<void>;
  onDelete: (itemId: string) => Promise<void>;
  isAdmin: boolean;
  title: string;
}

const TabContent: React.FC<TabContentProps> = ({ category, data, fields, onAdd, onUpdate, onDelete, isAdmin, title }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<AnySettingsItem | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [fileData, setFileData] = useState<Record<string, File | null>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  
  const validateHexColor = (color: string): boolean => {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
  };

  const openModal = (item: AnySettingsItem | null = null) => {
    setCurrentItem(item);
    setFormData(item ? { ...item } : fields.reduce((acc, field) => ({ ...acc, [field.key]: field.type === 'checkbox' ? false : '' }), {}));
    setFileData({});
    setFormErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentItem(null);
    setFormData({});
    setFileData({});
    setFormErrors({});
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target;
    const name = target.name;
    if (target instanceof HTMLInputElement && target.type === 'checkbox') {
        setFormData(prev => ({ ...prev, [name]: target.checked }));
    } else if (target instanceof HTMLInputElement && target.type === 'file') {
        const file = target.files ? target.files[0] : null;
        setFileData(prev => ({ ...prev, [name]: file }));
    } else {
        setFormData(prev => ({ ...prev, [name]: target.value }));
    }
  };

  const handleFieldChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));

    const fieldConfig = fields.find(f => f.key === name);
    if (fieldConfig && fieldConfig.type === 'color') {
        if (!validateHexColor(value)) {
            setFormErrors(prev => ({ ...prev, [name]: 'Formato de cor hexadecimal inválido. Use #RRGGBB.' }));
        } else {
            setFormErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const submissionData = { ...formData };

    for (const field of fields) {
        if (field.type === 'number') {
            const key = field.key;
            if (Object.prototype.hasOwnProperty.call(submissionData, key)) {
                const value = submissionData[key];
                const parsed = parseFloat(value);
                submissionData[key] = isNaN(parsed) ? null : parsed;
            }
        }
    }

    try {
        if (currentItem) {
          await onUpdate(submissionData as AnySettingsItem, fileData);
        } else {
          await onAdd(submissionData as Omit<AnySettingsItem, 'id'>, fileData);
        }
        closeModal();
    } catch (error) {
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
        await onDelete(deleteItemId);
        setDeleteItemId(null);
    }
  }
  
  const hasErrors = Object.keys(formErrors).length > 0;

  return (
    <div className="p-0">
      <div className="flex justify-between items-center mb-6 pt-6">
        <h2 className="text-2xl font-bold text-textPrimary dark:text-dark-textPrimary">{title}</h2>
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
            <thead className="bg-secondary dark:bg-dark-secondary">
              <tr>
                {fields.map(field => field.key !== 'id' && <th key={field.key} className="p-4 font-semibold text-textSecondary dark:text-dark-textSecondary">{field.label}</th>)}
                {isAdmin && <th className="p-4 font-semibold text-textSecondary dark:text-dark-textSecondary text-right">Ações</th>}
              </tr>
            </thead>
            <tbody>
              {data.map(item => (
                <tr key={item.id} className="border-b border-border dark:border-dark-border hover:bg-accent/50 dark:hover:bg-dark-accent/50">
                  {fields.map(field => field.key !== 'id' && (
                    <td key={field.key} className="p-4 text-textPrimary dark:text-dark-textPrimary">
                      {field.type === 'color' ? (
                        <div
                          className="flex items-center gap-3 cursor-pointer group"
                          title="Clique para copiar"
                          onClick={() => {
                            const hex = item[field.key as keyof AnySettingsItem] as string;
                            if (navigator.clipboard) {
                              navigator.clipboard.writeText(hex);
                              toast({ title: "Copiado!", description: `A cor ${hex} foi copiada.` });
                            }
                          }}
                        >
                          <div
                            className="w-6 h-6 rounded-md border-2 border-white dark:border-dark-card shadow-md group-hover:scale-110 transition-transform"
                            style={{ backgroundColor: item[field.key as keyof AnySettingsItem] as string }}
                          ></div>
                          <span className="font-mono text-sm group-hover:text-primary transition-colors">{(item[field.key as keyof AnySettingsItem] as string || '').toUpperCase()}</span>
                        </div>
                      ) : field.type === 'checkbox' ? (
                         <Badge variant={item[field.key as keyof AnySettingsItem] ? 'ativo' : 'inativo'}>
                             {item[field.key as keyof AnySettingsItem] ? 'Ativo' : 'Inativo'}
                         </Badge>
                      ) : field.type === 'file' ? (
                          item[field.key as keyof AnySettingsItem] ? 
                          <a href={item[field.key as keyof AnySettingsItem] as string} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs truncate">
                            {(item[field.key as keyof AnySettingsItem] as string).split('/').pop()}
                          </a> : <span className="text-xs text-textSecondary/70 dark:text-dark-textSecondary/70">Nenhum arquivo</span>
                      ) : (
                        String(item[field.key as keyof AnySettingsItem] ?? '')
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
         <div className="text-center text-textSecondary dark:text-dark-textSecondary py-16 border-2 border-dashed border-border dark:border-dark-border rounded-xl">
            <PackageOpen className="mx-auto h-12 w-12 text-textSecondary/60 dark:text-dark-textSecondary/60" />
            <h3 className="mt-4 text-lg font-medium text-textPrimary dark:text-dark-textPrimary">Nenhum item encontrado</h3>
            <p className="mt-1 text-sm text-textSecondary dark:text-dark-textSecondary">Comece adicionando um novo item para esta categoria.</p>
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

      <Modal isOpen={isModalOpen} onClose={closeModal} title={currentItem ? `Editar: ${'name' in currentItem && currentItem.name ? currentItem.name : ('type' in currentItem ? currentItem.type : currentItem.id)}` : `Adicionar Novo Item`}>
        <form onSubmit={handleSubmit}>
            <div className="space-y-4">
            {fields.map(field => field.key !== 'id' && (
                <div key={field.key}>
                    <label htmlFor={field.key} className="block text-sm font-medium text-textSecondary dark:text-dark-textSecondary mb-1">{field.label}</label>

                    {field.type === 'checkbox' ? (
                         <label className="flex items-center gap-2 text-sm text-textPrimary dark:text-dark-textPrimary cursor-pointer">
                            <input 
                                type="checkbox" 
                                id={field.key} 
                                name={field.key}
                                checked={!!formData[field.key]} 
                                onChange={handleInputChange}
                                className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-primary focus:ring-primary"
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
                            className="w-full px-3 py-2 border border-border dark:border-dark-border rounded-xl shadow-sm bg-background dark:bg-dark-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                    ) : field.type === 'select' ? (
                        <select
                            id={field.key}
                            name={field.key}
                            value={formData[field.key] || ''}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-border dark:border-dark-border rounded-xl shadow-sm bg-background dark:bg-dark-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                        >
                            <option value="">Selecione</option>
                            {field.options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                    ) : field.type === 'file' ? (
                        <div className="space-y-2">
                            <input 
                                type="file"
                                id={field.key}
                                name={field.key}
                                onChange={handleInputChange}
                                className="w-full text-sm text-textSecondary dark:text-dark-textSecondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                                accept=".ttf,.otf,.woff,.woff2"
                            />
                            {fileData[field.key] && (
                                <p className="text-xs text-green-600">Novo arquivo selecionado: {fileData[field.key]?.name}</p>
                            )}
                            {!fileData[field.key] && formData[field.key] && (
                                 <div className="text-xs text-textSecondary dark:text-dark-textSecondary">
                                    Arquivo atual: <a href={formData[field.key]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{formData[field.key].split('/').pop()}</a>
                                </div>
                            )}
                        </div>
                    ) : field.type === 'color' ? (
                         <>
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    value={formData[field.key] || '#ffffff'}
                                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                                    className="p-1 h-10 w-10 block bg-white border border-gray-200 cursor-pointer rounded-lg disabled:opacity-50 disabled:pointer-events-none dark:bg-dark-background dark:border-dark-border"
                                />
                                <input
                                    type="text"
                                    value={(formData[field.key] || '').toUpperCase()}
                                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                                    placeholder="#RRGGBB"
                                    className="w-24 p-2 font-mono text-sm border border-border dark:border-dark-border bg-background dark:bg-dark-background text-textPrimary dark:text-dark-textPrimary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                                />
                            </div>
                            {formErrors[field.key] && <p className="text-sm text-red-600 mt-1">{formErrors[field.key]}</p>}
                         </>
                    ) : (
                        <input
                            type={field.type}
                            id={field.key}
                            name={field.key}
                            value={formData[field.key] || ''}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-border dark:border-dark-border rounded-xl shadow-sm bg-background dark:bg-dark-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                            required={field.key === 'name' || field.key === 'codigo'}
                        />
                    )}
                </div>
            ))}
            </div>
          <div className="mt-6 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={closeModal} disabled={isSubmitting}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting || hasErrors}>
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