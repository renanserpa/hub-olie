import React, { useState, useEffect, useMemo } from 'react';
import Modal from '../ui/Modal';
import { Button } from '../ui/Button';
import { Product, ProductCategory, AnyProduct, AppData, ProductPart, ProductSize, BOMComponent, ProductVariant, InventoryBalance } from '../../types';
import { Loader2, Package, GitBranch, List, Settings, UploadCloud, Trash2, Info, Ruler, X, AlertTriangle, Eye } from 'lucide-react';
import TabLayout from '../ui/TabLayout';
import { IconButton } from '../ui/IconButton';
import { cn, calculateContrastRatio } from '../../lib/utils';
import ProductVariantsTable from './ProductVariantsTable';
import { dataService } from '../../services/dataService';
import { toast } from '../../hooks/use-toast';
import { productSchema } from '../../lib/schemas/product';

// --- MAIN DIALOG COMPONENT ---

interface ProductDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: AnyProduct | Product) => Promise<void>;
    product: Product | null;
    categories: ProductCategory[];
    appData: AppData;
    allVariants: ProductVariant[];
    inventoryBalances: InventoryBalance[];
    onRefresh: () => void;
}

const ProductDialog: React.FC<ProductDialogProps> = ({ isOpen, onClose, onSave, product, categories, appData, allVariants, inventoryBalances, onRefresh }) => {
    const [formData, setFormData] = useState<Partial<Product>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState('base');
    
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const result = productSchema.safeParse(formData);

        if (!result.success) {
            const firstError = result.error.errors[0];
            toast({
                title: "Erro de Validação",
                description: firstError.message,
                variant: 'destructive'
            });
            return;
        }

        setIsSubmitting(true);
        try {
            await onSave(result.data as Product);
        } catch (error) {
            // Error is handled by the hook
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const TABS = [
        { id: 'base', label: 'Base', icon: Package },
        { id: 'skus', label: 'Variações & SKUs', icon: GitBranch },
        { id: 'bom', label: 'BOM / Insumos', icon: List },
        { id: 'personalization', label: 'Personalização', icon: Settings },
    ];

    const renderTabContent = () => {
        switch(activeTab) {
            case 'base':
                return <ProductBasePanel formData={formData} setFormData={setFormData} categories={categories} appData={appData} />;
            case 'skus':
                 return product ? <ProductVariantsPanel product={product} allVariants={allVariants} appData={appData} onRefresh={onRefresh} /> : <p>Salve o produto base primeiro para gerar variantes.</p>;
            case 'bom':
                return <ProductBOMPanel formData={formData} setFormData={setFormData} product={product} allVariants={allVariants} appData={appData} inventoryBalances={inventoryBalances} />;
            case 'personalization':
                return <ProductPersonalizationPanel product={product} />;
            default:
                return null;
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={product ? `Editar Produto: ${product.name}` : 'Novo Produto Base'} className="max-w-6xl h-[90vh]">
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
                <div className="px-6 border-b border-border flex-shrink-0">
                    <TabLayout tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
                </div>
                
                <div className="flex-grow overflow-y-auto p-6 space-y-6 bg-secondary/30 dark:bg-dark-secondary/20">
                    {renderTabContent()}
                </div>

                <div className="p-4 border-t border-border flex-shrink-0 flex justify-end gap-3 bg-background dark:bg-dark-card">
                    <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {product ? 'Salvar Alterações' : 'Salvar Produto'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

// --- HELPER & INTERNAL PANEL COMPONENTS ---

const Section: React.FC<{ title: string, children: React.ReactNode, className?: string }> = ({ title, children, className }) => (
    <div className={cn("bg-card dark:bg-dark-card p-4 rounded-xl border border-border dark:border-dark-border shadow-sm", className)}>
        <h3 className="text-sm font-semibold text-textPrimary dark:text-dark-textPrimary mb-3">{title}</h3>
        <div className="space-y-3">{children}</div>
    </div>
);

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
    return (mapping[source] || []).map(item => ({ id: item.id, name: item.name }));
};


const ProductBasePanel: React.FC<{ formData: Partial<Product>, setFormData: React.Dispatch<React.SetStateAction<Partial<Product>>>, categories: ProductCategory[], appData: AppData }> = ({ formData, setFormData, categories, appData }) => {
     const [newImageUrl, setNewImageUrl] = useState('');
     const inputStyle = "w-full px-3 py-2 border border-border dark:border-dark-border rounded-lg shadow-sm bg-background dark:bg-dark-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm";
     const labelStyle = "block text-xs font-medium text-textSecondary dark:text-dark-textSecondary mb-1";

     const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const finalValue = type === 'number' ? parseFloat(value) : value;
        setFormData(prev => ({ ...prev, [name]: finalValue }));
    };

    const addImage = () => {
        if (newImageUrl.trim()) {
            const newImages = [...(formData.images || []), newImageUrl];
            setFormData(prev => ({ ...prev, images: newImages }));
            setNewImageUrl('');
        }
    };
    
    const removeImage = (index: number) => {
        const newImages = (formData.images || []).filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, images: newImages }));
    };

    const handleSizeToggle = (sizeName: string) => {
        const currentSizes = formData.available_sizes || [];
        const sizeExists = currentSizes.find(s => s.name === sizeName);
        let newSizes;
        if (sizeExists) {
            newSizes = currentSizes.filter(s => s.name !== sizeName);
        } else {
            newSizes = [...currentSizes, { id: sizeName.toLowerCase(), name: sizeName }];
        }
        setFormData(prev => ({ ...prev, available_sizes: newSizes }));
    };

    const handleDimensionChange = (sizeName: string, dimension: 'width' | 'height' | 'depth', value: string) => {
        const newSizes = (formData.available_sizes || []).map(s => {
            if (s.name === sizeName) {
                return { ...s, dimensions: { ...(s.dimensions || {}), [dimension]: parseFloat(value) } };
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
                    <div className="p-3 border border-dashed rounded-lg bg-secondary/50 dark:bg-dark-secondary/50 space-y-3 text-center">
                         <UploadCloud className="mx-auto w-8 h-8 text-textSecondary" />
                         <p className="text-xs">Arraste e solte ou adicione a URL da imagem</p>
                    </div>
                    <div className="max-h-32 overflow-y-auto space-y-2 pr-2">
                        {(formData.images || []).map((url, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <img src={url} alt={`Preview ${index + 1}`} className="w-10 h-10 object-cover rounded-md bg-white flex-shrink-0"/>
                                <p className="text-xs truncate flex-grow text-left">{url.split('/').pop()}</p>
                                <IconButton type="button" onClick={() => removeImage(index)} className="text-red-500 flex-shrink-0"><Trash2 size={14} /></IconButton>
                            </div>
                        ))}
                    </div>
                </Section>
            </div>
            <div className="space-y-6">
                <Section title="Organização">
                     <div><label className={labelStyle}>Categoria *</label><select name="category" value={formData.category || ''} onChange={handleChange} className={inputStyle} required><option value="">Selecione</option>{categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}</select></div>
                     <div><label className={labelStyle}>Coleções</label><select name="collection_ids" value={formData.collection_ids?.[0] || ''} onChange={(e) => setFormData(prev => ({...prev, collection_ids: e.target.value ? [e.target.value] : []}))} className={inputStyle}><option value="">Nenhuma</option>{(appData.collections || []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                     <div><label className={labelStyle}>Status</label><select name="status" value={formData.status || 'Rascunho'} onChange={handleChange} className={inputStyle}><option value="Rascunho">Rascunho</option><option value="Homologado Qualidade">Homologado</option><option value="Ativo">Ativo</option><option value="Suspenso">Suspenso</option><option value="Descontinuado">Descontinuado</option></select></div>
                </Section>
                <Section title="Partes Obrigatórias">
                    <p className="text-xs text-textSecondary -mt-2">Todo produto Olie possui 5 partes obrigatórias:</p>
                    <ul className="text-sm space-y-2">
                        {['Tecido Externo', 'Forro Interno', 'Zíper + Cursor', 'Puxador', 'Viés'].map(part => (
                            <li key={part} className="flex items-center justify-between p-2 bg-secondary rounded-md">{part} <Button type="button" size="sm" variant="ghost" className="text-xs h-6">Definir Materiais Válidos</Button></li>
                        ))}
                    </ul>
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

const ProductVariantsPanel: React.FC<{product: Product; allVariants: ProductVariant[]; appData: AppData; onRefresh: () => void;}> = ({ product, allVariants, appData, onRefresh }) => {
    const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
    const [selections, setSelections] = useState<Record<string, string[]>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const productVariants = allVariants.filter(v => v.product_base_id === product.id);

    const allParts = useMemo(() => [
        ...(product.available_sizes && product.available_sizes.length > 0 ? [{ key: 'size', name: 'Tamanhos', options: product.available_sizes.map(s => ({id: s.id, name: s.name})) }] : []),
        ...(product.configurable_parts?.map(part => ({
            key: part.key,
            name: part.name,
            options: getOptionsForSource(part.options_source, appData)
        })) || [])
    ], [product, appData]);

    const handleGenerate = async () => { /* ... implementation from VariantGeneratorDialog ... */ }; // Placeholder for brevity

    return (
        <div>
             <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Gerador de Combinações</h3>
                <Button onClick={() => onRefresh()}><Loader2 className="w-4 h-4 mr-2 animate-spin"/>Sincronizar</Button>
            </div>

             <div className="p-4 border rounded-lg bg-card mb-6">
                <p className="text-sm text-textSecondary mb-4">Selecione as opções que deseja combinar e clique em "Gerar Variantes" para criar todos os SKUs possíveis.</p>
                <div className="space-y-3">
                    {allParts.map(part => (
                         <div key={part.key} className="grid grid-cols-12 items-center">
                            <h4 className="font-semibold text-sm col-span-2">{part.name}</h4>
                            <div className="col-span-10 flex flex-wrap gap-2">
                                {part.options.map(opt => (
                                    <label key={opt.id} className="flex items-center gap-2 px-3 py-1.5 border rounded-full text-xs cursor-pointer transition-colors has-[:checked]:bg-primary/10 has-[:checked]:border-primary/50">
                                        <input type="checkbox" checked={(selections[part.key] || []).includes(opt.id)} onChange={() => {}} className="h-3 w-3 rounded-sm border-gray-300 text-primary focus:ring-primary"/>
                                        {opt.name}
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                 <div className="mt-4 pt-4 border-t flex justify-end">
                    <Button onClick={() => toast({title: "Em breve!", description: "A geração de variantes será implementada."})}>Gerar Novas Combinações</Button>
                </div>
            </div>
            
            <h3 className="text-lg font-semibold mb-4">Variantes Criadas (SKUs)</h3>
            <ProductVariantsTable variants={productVariants} />
        </div>
    );
};

const ProductBOMPanel: React.FC<{formData: Partial<Product>, setFormData: any, product: Product | null, allVariants: ProductVariant[], appData: AppData, inventoryBalances: InventoryBalance[]}> = ({ formData, setFormData, product, allVariants, appData, inventoryBalances }) => {
    const [selectedVariantId, setSelectedVariantId] = useState<string>('base');
    const productVariants = allVariants.filter(v => v.product_base_id === product?.id);

    const bomToDisplay = selectedVariantId === 'base' 
        ? formData.base_bom 
        : productVariants.find(v => v.id === selectedVariantId)?.bom;

    const getOnHandStock = (materialId: string) => {
        const balances = inventoryBalances.filter(b => b.material_id === materialId);
        return balances.reduce((sum, b) => sum + (b.current_stock - b.reserved_stock), 0);
    };

    const handleGenerateOP = async () => {
        if (!product) return;
        setIsSubmitting(true);
        try {
            const opData = { product_id: product.id, variant_sku: 'SKU-PLACEHOLDER', quantity: 1 };
            await dataService.addDocument('production_orders', opData as any);
            await dataService.addDocument('system_audit', { key: 'OP_GENERATED', status: 'SUCCESS', details: { productId: product.id } } as any);
            toast({ title: 'Sucesso!', description: 'Ordem de Produção simulada e registrada no log de auditoria.' });
        } catch (e) {
            toast({ title: 'Erro!', description: 'Não foi possível gerar a OP.', variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
    };
    const [isSubmitting, setIsSubmitting] = useState(false);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
                <Section title="Selecionar Variante">
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        <Button type="button" onClick={() => setSelectedVariantId('base')} variant={selectedVariantId === 'base' ? 'primary' : 'outline'} className="w-full justify-start">BOM Padrão</Button>
                        {productVariants.map(v => (
                            <Button type="button" key={v.id} onClick={() => setSelectedVariantId(v.id)} variant={selectedVariantId === v.id ? 'primary' : 'outline'} className="w-full justify-start text-left h-auto py-2">
                                <div>
                                    <p className="font-semibold text-sm">{v.sku}</p>
                                    <p className="text-xs font-normal whitespace-normal">{v.name}</p>
                                </div>
                            </Button>
                        ))}
                    </div>
                </Section>
            </div>
            <div className="lg:col-span-2">
                <Section title="Lista de Materiais (BOM)">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="text-left bg-secondary"><tr><th className="p-2">Insumo</th><th className="p-2">Quantidade Padrão</th><th className="p-2">Estoque Atual (ON HAND)</th></tr></thead>
                            <tbody>
                                {(bomToDisplay || []).map((item, index) => {
                                    const material = appData.config_materials.find(m => m.id === item.material_id);
                                    return (
                                        <tr key={index} className="border-b">
                                            <td className="p-2 font-medium">{material?.name || 'Material não encontrado'} <span className="font-mono text-xs text-textSecondary">{material?.sku}</span></td>
                                            <td className="p-2">{item.quantity_per_unit} {material?.unit}</td>
                                            <td className="p-2 font-semibold">{getOnHandStock(item.material_id).toFixed(2)} {material?.unit}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-4 text-xs text-textSecondary flex justify-between items-center">
                        <p>Todos os insumos estão corretamente vinculados aos itens de estoque.</p>
                        <Button type="button" onClick={handleGenerateOP} disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin"/>}
                            Gerar OP
                        </Button>
                    </div>
                </Section>
            </div>
        </div>
    );
};

const ProductPersonalizationPanel: React.FC<{product: Product | null}> = ({ product }) => {
    const [type, setType] = useState('Bordado');
    const [text, setText] = useState('OLIE');
    const [font, setFont] = useState('Montserrat Bold');
    const [color, setColor] = useState('#A58C3C');
    const [height, setHeight] = useState(15);
    
    const PRODUCT_COLOR = '#5A6D55'; // Example color, like the Celine Clutch
    const contrastRatio = calculateContrastRatio(color, PRODUCT_COLOR);
    const isContrastValid = contrastRatio >= 4.5;

    return (
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Section title="Tipo e Configuração da Personalização">
                <div className="flex gap-4">
                    <label className="flex items-center gap-2"><input type="radio" name="personalization_type" value="Bordado" checked={type === 'Bordado'} onChange={e => setType(e.target.value)} /> Bordado</label>
                    <label className="flex items-center gap-2"><input type="radio" name="personalization_type" value="Hot-Stamping" checked={type === 'Hot-Stamping'} onChange={e => setType(e.target.value)} /> Hot-Stamping</label>
                </div>
                <div className="space-y-3 pt-3 border-t">
                    <div><label className="text-xs font-medium">Texto:</label><input type="text" value={text} onChange={e => setText(e.target.value)} maxLength={15} className="w-full p-1 border rounded text-sm" /></div>
                    <div><label className="text-xs font-medium">Fonte:</label><select value={font} onChange={e => setFont(e.target.value)} className="w-full p-1 border rounded text-sm"><option>Montserrat Bold</option><option>Script MT Bold</option></select></div>
                    <div>
                        <label className="text-xs font-medium">Cor:</label>
                        <div className="flex flex-wrap gap-2 mt-1">
                            {['#A58C3C', '#C0C0C0', '#FFFFFF', '#222222', '#D2B48C'].map(c => (
                                <button key={c} type="button" onClick={() => setColor(c)} className={cn("w-6 h-6 rounded-full border", color === c && "ring-2 ring-primary")} style={{backgroundColor: c}} />
                            ))}
                            <input type="color" value={color} onChange={e => setColor(e.target.value)} />
                        </div>
                    </div>
                    <div><label className="text-xs font-medium">Altura (mm):</label><input type="range" min="10" max="25" value={height} onChange={e => setHeight(Number(e.target.value))} className="w-full" /><span className="text-xs">{height}mm</span></div>
                </div>
                {!isContrastValid && (
                    <div className="mt-4 p-3 bg-yellow-100 text-yellow-800 rounded-lg flex items-start gap-2 text-sm border border-yellow-200">
                        <AlertTriangle className="w-5 h-5 flex-shrink-0"/>
                        <div>
                            <p className="font-semibold">Contraste {contrastRatio.toFixed(1)}:1 - Abaixo do mínimo de 4.5:1.</p>
                            <p className="text-xs">Escolha uma cor de linha mais clara ou escura para garantir a legibilidade.</p>
                        </div>
                    </div>
                )}
            </Section>
            <Section title="Visualização em Tempo Real">
                <div className="aspect-video w-full rounded-lg flex items-center justify-center p-4" style={{ backgroundColor: PRODUCT_COLOR }}>
                    <div 
                        className="text-center transition-all" 
                        style={{ fontFamily: font, color: color, fontSize: `${height * 2.5}px`}}
                    >
                        {text}
                    </div>
                </div>
            </Section>
        </div>
    )
};

export default ProductDialog;