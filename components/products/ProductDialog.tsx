import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { Button } from '../ui/Button';
import { Product, ProductCategory, AnyProduct, AppData, ProductPart, ProductSize, BOMComponent, CombinationRule, Collection } from '../../types';
import { Loader2, Package, Ruler, Settings, Share2, List, Plus, Trash2, Info } from 'lucide-react';
import TabLayout from '../ui/TabLayout';
import { IconButton } from '../ui/IconButton';
import { cn } from '../../lib/utils';

interface ProductDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: AnyProduct | Product) => Promise<void>;
    product: Product | null;
    categories: ProductCategory[];
    appData: AppData;
}

const getOptionsForSource = (source: ProductPart['options_source'] | undefined, appData: AppData): { id: string, name: string }[] => {
    if (!source || !appData) return [];
    const mapping = {
        fabric_colors: appData.catalogs.cores_texturas.tecido,
        zipper_colors: appData.catalogs.cores_texturas.ziper,
        lining_colors: appData.catalogs.cores_texturas.forro,
        puller_colors: appData.catalogs.cores_texturas.puxador,
        bias_colors: appData.catalogs.cores_texturas.vies,
        embroidery_colors: appData.catalogs.cores_texturas.bordado,
        config_materials: appData.config_materials
    };
    const result = mapping[source] || [];
    return result.map(item => ({ id: item.id, name: item.name }));
};


const SectionCard: React.FC<{ title: string; icon: React.ElementType; children: React.ReactNode, actions?: React.ReactNode }> = ({ title, icon: Icon, children, actions }) => (
    <div className="p-4 border rounded-lg bg-secondary/50 dark:bg-dark-secondary/50">
        <div className="flex justify-between items-center mb-3">
            <h4 className="font-semibold text-textPrimary dark:text-dark-textPrimary flex items-center gap-2">
                <Icon size={16} />
                {title}
            </h4>
            {actions && <div>{actions}</div>}
        </div>
        <div className="space-y-3">{children}</div>
    </div>
);

const ProductDialog: React.FC<ProductDialogProps> = ({ isOpen, onClose, onSave, product, categories, appData }) => {
    const [formData, setFormData] = useState<Partial<Product>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState('base');
    const [newImageUrl, setNewImageUrl] = useState('');

    useEffect(() => {
        if (isOpen) {
            const initialData: Partial<Product> = product ? { ...product } : {
                name: '', base_sku: '', base_price: 0, category: '', status: 'Rascunho', images: [],
                available_sizes: [], configurable_parts: [], combination_rules: [], base_bom: [], collection_ids: []
            };
            setFormData(initialData);
            setActiveTab('base');
        }
    }, [product, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const finalValue = type === 'number' ? parseFloat(value) : value;
        setFormData(prev => ({ ...prev, [name]: finalValue }));
    };

    const handleArrayChange = (arrayName: keyof Product, index: number, field: string, value: any) => {
        setFormData(prev => {
            const newArray = [...((prev as any)[arrayName] || [])];
            newArray[index] = { ...newArray[index], [field]: value };
            return { ...prev, [arrayName]: newArray };
        });
    };
    const addToArray = (arrayName: keyof Product, newItem: any) => {
        setFormData(prev => ({ ...prev, [arrayName]: [...((prev as any)[arrayName] || []), newItem] }));
    };
    const removeFromArray = (arrayName: keyof Product, index: number) => {
        setFormData(prev => ({ ...prev, [arrayName]: ((prev as any)[arrayName] || []).filter((_: any, i: number) => i !== index) }));
    };

    const handleRuleChange = (index: number, part: 'condition' | 'consequence', field: string, value: any) => {
        setFormData(prev => {
            const newRules = [...(prev.combination_rules || [])];
            const rule = newRules[index];
            
            const updatedPart = { ...rule[part], [field]: value };
            
            // FIX: Type-cast the updated part to correctly access its properties.
            if (field === 'part_key') {
                if(part === 'condition') {
                    (updatedPart as CombinationRule['condition']).option_id = '';
                }
                if(part === 'consequence') {
                    (updatedPart as CombinationRule['consequence']).allowed_option_ids = [];
                }
            }
            
            newRules[index] = { ...rule, [part]: updatedPart };

            return { ...prev, combination_rules: newRules };
        });
    };

    const addImage = () => {
        if (newImageUrl.trim() && (URL.canParse?.(newImageUrl) || newImageUrl.startsWith('http'))) {
            const newImages = [...(formData.images || []), newImageUrl];
            setFormData(prev => ({ ...prev, images: newImages }));
            setNewImageUrl('');
        } else {
            alert("Por favor, insira uma URL de imagem válida.");
        }
    };
    
    const removeImage = (index: number) => {
        const newImages = (formData.images || []).filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, images: newImages }));
    };

    const handleImageChange = (index: number, value: string) => {
        const newImages = [...(formData.images || [])];
        newImages[index] = value;
        setFormData(prev => ({ ...prev, images: newImages }));
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onSave(formData as Product);
        } catch (error) {
            // Error is handled by the hook
        } finally {
            setIsSubmitting(false);
        }
    };

    const TABS = [ { id: 'base', label: 'Informações Básicas', icon: Package }, { id: 'variants', label: 'Configuração de Variantes', icon: Settings }, ];
    const inputStyle = "w-full px-3 py-2 border border-border rounded-xl shadow-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm";
    const labelStyle = "block text-sm font-medium text-textSecondary mb-1";

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={product ? `Editar Produto: ${product.name}` : 'Novo Produto Base'} className="max-w-4xl h-[90vh]">
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
                <div className="px-6 border-b border-border">
                    <TabLayout tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
                </div>
                
                <div className="flex-grow overflow-y-auto p-6 space-y-6">
                    {activeTab === 'base' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div><label className={labelStyle}>Nome do Produto Base *</label><input name="name" value={formData.name || ''} onChange={handleChange} required className={inputStyle} /></div>
                                <div><label className={labelStyle}>Descrição</label><textarea name="description" value={formData.description || ''} onChange={handleChange} rows={4} className={inputStyle} /></div>
                                <div>
                                    <label className={labelStyle}>Imagens do Produto</label>
                                    <div className="p-3 border rounded-lg bg-secondary/50 dark:bg-dark-secondary/50 space-y-3">
                                        <div className="max-h-32 overflow-y-auto space-y-2 pr-2">
                                            {(formData.images || []).map((url, index) => (
                                                <div key={index} className="flex items-center gap-2">
                                                    <img src={url} alt={`Preview ${index + 1}`} className="w-10 h-10 object-cover rounded-md bg-white flex-shrink-0"/>
                                                    <input 
                                                        type="text" 
                                                        value={url}
                                                        onChange={(e) => handleImageChange(index, e.target.value)} 
                                                        className="flex-grow p-1 text-xs border rounded-md bg-background"
                                                    />
                                                    <IconButton type="button" onClick={() => removeImage(index)} className="text-red-500 flex-shrink-0"><Trash2 size={16} /></IconButton>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-2 pt-2 border-t">
                                            <input 
                                                type="text" 
                                                placeholder="https://exemplo.com/imagem.jpg" 
                                                value={newImageUrl}
                                                onChange={(e) => setNewImageUrl(e.target.value)}
                                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addImage(); } }}
                                                className="flex-grow p-1.5 text-xs border rounded-md bg-background"
                                            />
                                            <Button type="button" size="sm" variant="outline" onClick={addImage}>Adicionar</Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                             <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className={labelStyle}>SKU Base *</label><input name="base_sku" value={formData.base_sku || ''} onChange={handleChange} required className={inputStyle} /></div>
                                    <div><label className={labelStyle}>Preço Base (R$) *</label><input name="base_price" type="number" step="0.01" value={formData.base_price || 0} onChange={handleChange} required className={inputStyle} /></div>
                                </div>
                                <div><label className={labelStyle}>Categoria</label><select name="category" value={formData.category || ''} onChange={handleChange} className={inputStyle}><option value="">Selecione</option>{categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}</select></div>
                                <div><label className={labelStyle}>Coleções</label><select name="collection_ids" value={formData.collection_ids?.[0] || ''} onChange={(e) => setFormData(prev => ({...prev, collection_ids: [e.target.value]}))} className={inputStyle}><option value="">Nenhuma</option>{(appData.collections || []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                                <div><label className={labelStyle}>Status</label><select name="status" value={formData.status || 'Rascunho'} onChange={handleChange} className={inputStyle}><option value="Rascunho">Rascunho</option><option value="Homologado Qualidade">Homologado Qualidade</option><option value="Ativo">Ativo</option><option value="Suspenso">Suspenso</option><option value="Descontinuado">Descontinuado</option></select></div>
                            </div>
                        </div>
                    )}
                    {activeTab === 'variants' && (
                        <div className="space-y-6">
                             <div className="p-3 bg-blue-100/50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-200 text-sm rounded-lg flex items-start gap-3">
                                <Info size={18} className="flex-shrink-0 mt-0.5"/>
                                <div>
                                    Defina aqui as regras de personalização do seu produto. Adicione tamanhos, partes configuráveis (como cores e tecidos) e regras de combinação.
                                    <br />
                                    Após salvar, você poderá gerar todos os SKUs de venda na aba <strong>'Variantes & SKUs'</strong>.
                                </div>
                            </div>

                            <SectionCard title="Tamanhos Disponíveis" icon={Ruler} actions={<Button type="button" size="sm" variant="outline" onClick={() => addToArray('available_sizes', { id: `s_${Date.now()}`, name: '' })}><Plus size={14} className="mr-2"/>Adicionar</Button>}>
                                {(formData.available_sizes || []).map((size, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <input value={size.name} onChange={(e) => handleArrayChange('available_sizes', index, 'name', e.target.value)} placeholder="Ex: P, M, G..." className={cn(inputStyle, "mt-0")} />
                                        <IconButton type="button" onClick={() => removeFromArray('available_sizes', index)} className="text-red-500"><Trash2 size={16} /></IconButton>
                                    </div>
                                ))}
                            </SectionCard>

                            <SectionCard title="Partes Configuráveis" icon={Settings} actions={<Button type="button" size="sm" variant="outline" onClick={() => addToArray('configurable_parts', { id: `p_${Date.now()}`, key: '', name: '', options_source: 'fabric_colors' })}><Plus size={14} className="mr-2"/>Adicionar</Button>}>
                                {(formData.configurable_parts || []).map((part, index) => (
                                    <div key={index} className="grid grid-cols-12 gap-2 items-center">
                                        <div className="col-span-3"><input value={part.key} onChange={(e) => handleArrayChange('configurable_parts', index, 'key', e.target.value)} placeholder="chave_unica" className={cn(inputStyle, "mt-0")} /></div>
                                        <div className="col-span-4"><input value={part.name} onChange={(e) => handleArrayChange('configurable_parts', index, 'name', e.target.value)} placeholder="Nome de Exibição" className={cn(inputStyle, "mt-0")} /></div>
                                        <div className="col-span-4"><select value={part.options_source} onChange={(e) => handleArrayChange('configurable_parts', index, 'options_source', e.target.value)} className={cn(inputStyle, "mt-0")}><option value="fabric_colors">Cores de Tecido</option><option value="zipper_colors">Cores de Zíper</option><option value="lining_colors">Cores de Forro</option><option value="puller_colors">Cores de Puxador</option><option value="bias_colors">Cores de Viés</option><option value="embroidery_colors">Cores de Bordado</option><option value="config_materials">Materiais</option></select></div>
                                        <div className="col-span-1 text-right"><IconButton type="button" onClick={() => removeFromArray('configurable_parts', index)} className="text-red-500"><Trash2 size={16} /></IconButton></div>
                                    </div>
                                ))}
                            </SectionCard>
                            
                            <SectionCard title="Lista de Materiais (BOM)" icon={List} actions={<Button type="button" size="sm" variant="outline" onClick={() => addToArray('base_bom', { material_id: '', quantity_per_unit: 1 })}><Plus size={14} className="mr-2"/>Adicionar</Button>}>
                                {(formData.base_bom || []).map((bom, index) => (
                                    <div key={index} className="grid grid-cols-12 gap-2 items-center">
                                        <div className="col-span-8"><select value={bom.material_id} onChange={(e) => handleArrayChange('base_bom', index, 'material_id', e.target.value)} className={cn(inputStyle, "mt-0")}><option value="">Selecione um material...</option>{appData.config_materials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select></div>
                                        <div className="col-span-3"><input type="number" value={bom.quantity_per_unit} onChange={(e) => handleArrayChange('base_bom', index, 'quantity_per_unit', parseFloat(e.target.value))} className={cn(inputStyle, "mt-0")} /></div>
                                        <div className="col-span-1 text-right"><IconButton type="button" onClick={() => removeFromArray('base_bom', index)} className="text-red-500"><Trash2 size={16} /></IconButton></div>
                                    </div>
                                ))}
                            </SectionCard>
                            
                            <SectionCard title="Regras de Combinação" icon={Share2} actions={<Button type="button" size="sm" variant="outline" onClick={() => addToArray('combination_rules', { id: `r_${Date.now()}`, condition: { part_key: '', option_id: '' }, consequence: { part_key: '', allowed_option_ids: [] } })}><Plus size={14} className="mr-2"/>Adicionar</Button>}>
                                {(formData.combination_rules || []).map((rule, index) => {
                                    const conditionPart = formData.configurable_parts?.find(p => p.key === rule.condition.part_key);
                                    const conditionOptions = getOptionsForSource(conditionPart?.options_source, appData);
                                    const consequencePart = formData.configurable_parts?.find(p => p.key === rule.consequence.part_key);
                                    const consequenceOptions = getOptionsForSource(consequencePart?.options_source, appData);

                                    return (
                                        <div key={index} className="p-3 border rounded-md bg-background dark:bg-dark-background space-y-2">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-sm">SE</span>
                                                <select value={rule.condition.part_key} onChange={e => handleRuleChange(index, 'condition', 'part_key', e.target.value)} className="p-1 border rounded-md text-sm"><option value="">Parte...</option>{formData.configurable_parts?.map(p => <option key={p.id} value={p.key}>{p.name}</option>)}</select>
                                                <span className="text-sm">for</span>
                                                <select value={rule.condition.option_id} onChange={e => handleRuleChange(index, 'condition', 'option_id', e.target.value)} className="p-1 border rounded-md text-sm" disabled={!conditionPart}><option value="">Opção...</option>{conditionOptions.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}</select>
                                                <IconButton type="button" onClick={() => removeFromArray('combination_rules', index)} className="text-red-500 ml-auto"><Trash2 size={16} /></IconButton>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <span className="font-semibold text-sm mt-1">ENTÃO</span>
                                                <select value={rule.consequence.part_key} onChange={e => handleRuleChange(index, 'consequence', 'part_key', e.target.value)} className="p-1 border rounded-md text-sm"><option value="">Parte...</option>{formData.configurable_parts?.map(p => <option key={p.id} value={p.key}>{p.name}</option>)}</select>
                                                <div className="flex-1">
                                                    <p className="text-sm">só pode usar:</p>
                                                    <div className="max-h-24 overflow-y-auto mt-1 space-y-1 p-2 bg-secondary rounded-md">
                                                    {consequenceOptions.map(opt => (
                                                        <label key={opt.id} className="flex items-center gap-2 text-xs">
                                                            <input type="checkbox" checked={(rule.consequence.allowed_option_ids || []).includes(opt.id)} onChange={e => {
                                                                const currentIds = rule.consequence.allowed_option_ids || [];
                                                                const newIds = e.target.checked ? [...currentIds, opt.id] : currentIds.filter(id => id !== opt.id);
                                                                handleRuleChange(index, 'consequence', 'allowed_option_ids', newIds);
                                                            }}/> {opt.name}
                                                        </label>
                                                    ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </SectionCard>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-border flex-shrink-0 flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Salvar Produto
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default ProductDialog;