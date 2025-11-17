import React, { useState } from 'react';
import { Product, ProductCategory, AppData, BOMComponent } from '../../../types';
import { cn } from '../../../lib/utils';
import { Button } from '../../ui/Button';
import { Trash2, Info, Plus } from 'lucide-react';
import { IconButton } from '../../ui/IconButton';
import { MediaUploadCard } from '../../media/MediaUploadCard';
import { toast } from '../../../hooks/use-toast';

const Section: React.FC<{ title: string, children: React.ReactNode, className?: string }> = ({ title, children, className }) => (
    <div className={cn("bg-card dark:bg-dark-card p-4 rounded-xl border border-border dark:border-dark-border shadow-sm", className)}>
        <h3 className="text-sm font-semibold text-textPrimary dark:text-dark-textPrimary mb-3">{title}</h3>
        <div className="space-y-3">{children}</div>
    </div>
);

const ProductBasePanel: React.FC<{ formData: Partial<Product>, setFormData: React.Dispatch<React.SetStateAction<Partial<Product>>>, categories: ProductCategory[], appData: AppData }> = ({ formData, setFormData, categories, appData }) => {
     const [newBomItem, setNewBomItem] = useState<{ material_id: string; quantity_per_unit: number | '' }>({ material_id: '', quantity_per_unit: '' });
     
     const inputStyle = "w-full px-3 py-2 border border-border dark:border-dark-border rounded-lg shadow-sm bg-background dark:bg-dark-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm";
     const labelStyle = "block text-xs font-medium text-textSecondary dark:text-dark-textSecondary mb-1";

     const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const finalValue = type === 'number' ? parseFloat(value) : value;
        setFormData(prev => ({ ...prev, [name]: finalValue }));
    };

    const removeImage = (index: number) => {
        const newImages = (formData.images || []).filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, images: newImages }));
    };

    const handleUploadSuccess = (result: { drive_file_id: string; url_public: string }) => {
        setFormData(prev => ({ ...prev, images: [...(prev.images || []), result.url_public] }));
        toast({ title: "Imagem Adicionada!", description: "A imagem foi vinculada ao produto." });
    };

    const handleBomItemRemove = (index: number) => {
        const newBom = [...(formData.base_bom || [])];
        newBom.splice(index, 1);
        setFormData(prev => ({ ...prev, base_bom: newBom }));
    };

    const addBomItem = () => {
        if (!newBomItem.material_id || !newBomItem.quantity_per_unit || newBomItem.quantity_per_unit <= 0) {
            toast({ title: "Atenção", description: "Selecione um material e uma quantidade válida.", variant: 'destructive' });
            return;
        }
        const newBom = [...(formData.base_bom || []), { material_id: newBomItem.material_id, quantity_per_unit: Number(newBomItem.quantity_per_unit) }];
        setFormData(prev => ({ ...prev, base_bom: newBom }));
        setNewBomItem({ material_id: '', quantity_per_unit: '' }); // Reset form
    };

    const handleSizeToggle = (sizeName: string) => {
        const currentSizes = formData.available_sizes || [];
        const sizeExists = currentSizes.find(s => s.name === sizeName);
        let newSizes;
        if (sizeExists) {
            newSizes = currentSizes.filter(s => s.name !== sizeName);
        } else {
            newSizes = [...currentSizes, { id: sizeName.toLowerCase(), name: sizeName, dimensions: {} }];
        }
        setFormData(prev => ({ ...prev, available_sizes: newSizes }));
    };

    const handleDimensionChange = (sizeName: string, dimension: 'width' | 'height' | 'depth', value: string) => {
        const newSizes = (formData.available_sizes || []).map(s => {
            if (s.name === sizeName) {
                return { ...s, dimensions: { ...(s.dimensions || {}), [dimension]: parseFloat(value) || undefined } };
            }
            return s;
        });
        setFormData(prev => ({ ...prev, available_sizes: newSizes }));
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
                <Section title="Informações Essenciais">
                    <div><label className={labelStyle}>Nome do Produto Base *</label><input name="name" value={formData.name || ''} onChange={handleChange} required className={inputStyle} /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className={labelStyle}>SKU Base *</label><input name="base_sku" value={formData.base_sku || ''} onChange={handleChange} required className={inputStyle} /></div>
                        <div><label className={labelStyle}>Preço Base (R$) *</label><input name="base_price" type="number" step="0.01" value={formData.base_price || 0} onChange={handleChange} required className={inputStyle} /></div>
                    </div>
                    <div><label className={labelStyle}>Descrição</label><textarea name="description" value={formData.description || ''} onChange={handleChange} rows={3} className={inputStyle} /></div>
                </Section>
                <Section title="Imagens e Fotos de Referência">
                     <MediaUploadCard 
                        module="products" 
                        category={formData.base_sku || 'new_product'} 
                        onUploadSuccess={handleUploadSuccess}
                    />
                    {(formData.images && formData.images.length > 0) && (
                        <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-2">
                            {(formData.images || []).map((url, index) => (
                                <div key={index} className="relative aspect-square group bg-secondary rounded-md">
                                    <img src={url} alt={`Preview ${index + 1}`} className="w-full h-full object-cover rounded-md" />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-md">
                                        <IconButton type="button" onClick={() => removeImage(index)} className="text-white hover:text-red-500 bg-black/20 hover:bg-black/50">
                                            <Trash2 size={16} />
                                        </IconButton>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Section>
            </div>
            <div className="space-y-6">
                <Section title="Organização">
                     <div><label className={labelStyle}>Categoria *</label><select name="category" value={formData.category || ''} onChange={handleChange} className={inputStyle} required><option value="">Selecione</option>{categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}</select></div>
                     <div><label className={labelStyle}>Coleções</label><select name="collection_ids" value={formData.collection_ids?.[0] || ''} onChange={(e) => setFormData(prev => ({...prev, collection_ids: e.target.value ? [e.target.value] : []}))} className={inputStyle}><option value="">Nenhuma</option>{(appData.collections || []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                     <div><label className={labelStyle}>Status</label><select name="status" value={formData.status || 'Rascunho'} onChange={handleChange} className={inputStyle}><option value="Rascunho">Rascunho</option><option value="Homologado Qualidade">Homologado</option><option value="Ativo">Ativo</option><option value="Suspenso">Suspenso</option><option value="Descontinuado">Descontinuado</option></select></div>
                </Section>
                
                 <Section title="Lista de Materiais Base (BOM)">
                    <div className="space-y-2">
                        {(formData.base_bom || []).map((item, index) => {
                            const material = appData.config_materials.find(m => m.id === item.material_id);
                            return (
                                <div key={index} className="flex items-center gap-2 p-2 bg-secondary rounded-md">
                                    <span className="flex-grow text-sm">{material?.name || 'Material inválido'}</span>
                                    <span className="text-sm font-semibold">{item.quantity_per_unit} {material?.unit}</span>
                                    <IconButton type="button" onClick={() => handleBomItemRemove(index)} className="text-red-500">
                                        <Trash2 size={14} />
                                    </IconButton>
                                </div>
                            );
                        })}
                    </div>
                    <div className="mt-3 pt-3 border-t">
                        <h4 className="text-xs font-semibold mb-2">Adicionar Insumo</h4>
                        <div className="grid grid-cols-12 gap-2">
                             {appData.config_materials && appData.config_materials.length > 0 ? (
                                <select
                                    value={newBomItem.material_id}
                                    onChange={(e) => setNewBomItem({ ...newBomItem, material_id: e.target.value })}
                                    className={cn(inputStyle, "col-span-7")}
                                >
                                    <option value="">Selecione o material</option>
                                    {appData.config_materials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                </select>
                             ) : (
                                <div className={cn(inputStyle, "col-span-7", "bg-secondary/50 text-textSecondary text-xs flex items-center")}>
                                    Nenhum material cadastrado
                                </div>
                             )}
                            <input
                                type="number"
                                placeholder="Qtd."
                                value={newBomItem.quantity_per_unit}
                                onChange={(e) => setNewBomItem({ ...newBomItem, quantity_per_unit: parseFloat(e.target.value) || '' })}
                                className={cn(inputStyle, "col-span-3")}
                            />
                            <Button type="button" onClick={addBomItem} className="col-span-2"><Plus size={16}/></Button>
                        </div>
                    </div>
                </Section>

                 <Section title="Tamanhos Disponíveis">
                    <div className="flex gap-2 mb-3">
                        {['P', 'M', 'G', 'GG'].map(size => (
                            <Button key={size} type="button" variant={(formData.available_sizes || []).some(s => s.name === size) ? 'primary' : 'outline'} onClick={() => handleSizeToggle(size)}>{size}</Button>
                        ))}
                    </div>
                    {(formData.available_sizes || []).sort((a,b) => ['P','M','G','GG'].indexOf(a.name) - ['P','M','G','GG'].indexOf(b.name)).map(size => (
                        <div key={size.name} className="grid grid-cols-4 gap-2 items-center">
                            <label className="font-semibold text-sm">{size.name}</label>
                            <input type="number" placeholder="Altura (cm)" value={size.dimensions?.height || ''} onChange={e => handleDimensionChange(size.name, 'height', e.target.value)} className={cn(inputStyle, "text-xs")} />
                            <input type="number" placeholder="Largura (cm)" value={size.dimensions?.width || ''} onChange={e => handleDimensionChange(size.name, 'width', e.target.value)} className={cn(inputStyle, "text-xs")} />
                            <input type="number" placeholder="Prof. (cm)" value={size.dimensions?.depth || ''} onChange={e => handleDimensionChange(size.name, 'depth', e.target.value)} className={cn(inputStyle, "text-xs")} />
                        </div>
                    ))}
                     <div className="flex items-center gap-2 text-xs text-textSecondary border-t pt-2 mt-2"><Info size={14}/> Tolerância de costura padrão: ±3mm</div>
                </Section>
            </div>
        </div>
    );
};

export default ProductBasePanel;