import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Product, ProductCategory, AnyProduct, AppData, ProductPart, ProductVariant, InventoryBalance, BOMComponent } from '../../types';
import { Loader2, Package, GitBranch, List, Settings, UploadCloud, Trash2, Info, X } from 'lucide-react';
import TabLayout from '../ui/TabLayout';
import { IconButton } from '../ui/IconButton';
import { cn } from '../../lib/utils';
import ProductVariantsPanel from './ProductVariantsPanel';
import { dataService } from '../../services/dataService';
import { toast } from '../../hooks/use-toast';
import { productSchema } from '../../lib/schemas/product';

// --- MAIN DRAWER COMPONENT ---

interface ProductDrawerProps {
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

const ProductDrawer: React.FC<ProductDrawerProps> = ({ isOpen, onClose, onSave, product, categories, appData, allVariants, inventoryBalances, onRefresh }) => {
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
            await onSave(result.data as unknown as (AnyProduct | Product));
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
                 return product ? <ProductVariantsPanel product={product} allVariants={allVariants} appData={appData} isLoading={isSubmitting} onRefresh={onRefresh} /> : <p className="text-center text-sm text-textSecondary p-8">Salve o produto base primeiro para poder gerar variantes.</p>;
            case 'bom':
                return <ProductBOMPanel formData={formData} setFormData={setFormData} product={product} allVariants={allVariants} appData={appData} inventoryBalances={inventoryBalances} />;
            case 'personalization':
                return <ProductPersonalizationPanel product={product} />;
            default:
                return null;
        }
    }

    return (
        <div 
            className={cn(
                "fixed inset-0 bg-black/60 z-40 transition-opacity",
                isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
            onClick={onClose}
        >
            <form
                onSubmit={handleSubmit}
                className={cn(
                    "fixed top-0 right-0 h-full w-full max-w-4xl bg-card dark:bg-dark-card shadow-lg flex flex-col transition-transform duration-300",
                    isOpen ? "translate-x-0" : "translate-x-full"
                )}
                onClick={e => e.stopPropagation()}
            >
                 {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-border dark:border-dark-border flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-textPrimary dark:text-dark-textPrimary">{product ? `Editar Produto: ${product.name}` : 'Novo Produto Base'}</h2>
                    </div>
                    <Button variant="ghost" type="button" size="icon" onClick={onClose}><X /></Button>
                </div>
                
                {/* Tabs */}
                <div className="px-4 border-b border-border dark:border-dark-border flex-shrink-0">
                    <TabLayout tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
                </div>
                
                {/* Content */}
                <div className="flex-grow overflow-y-auto p-6 space-y-6 bg-secondary/30 dark:bg-dark-secondary/20">
                    {renderTabContent()}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-border flex-shrink-0 flex justify-end gap-3 bg-background dark:bg-dark-card">
                    <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {product ? 'Salvar Alterações' : 'Salvar Produto'}
                    </Button>
                </div>
            </form>
        </div>
    );
};


// --- HELPER & INTERNAL PANEL COMPONENTS ---
// These were inside ProductDialog.tsx and are moved here.

const Section: React.FC<{ title: string, children: React.ReactNode, className?: string }> = ({ title, children, className }) => (
    <div className={cn("bg-card dark:bg-dark-card p-4 rounded-xl border border-border dark:border-dark-border shadow-sm", className)}>
        <h3 className="text-sm font-semibold text-textPrimary dark:text-dark-textPrimary mb-3">{title}</h3>
        <div className="space-y-3">{children}</div>
    </div>
);

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


const ProductBOMPanel: React.FC<{formData: Partial<Product>, setFormData: any, product: Product | null, allVariants: ProductVariant[], appData: AppData, inventoryBalances: InventoryBalance[]}> = ({ formData, setFormData, product, allVariants, appData, inventoryBalances }) => {
    const [selectedVariantId, setSelectedVariantId] = useState<string>('base');
    const [isSubmitting, setIsSubmitting] = useState(false);
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
                                    if (!material) return <tr key={index}><td colSpan={3}>Material não encontrado</td></tr>;
                                    const onHand = getOnHandStock(material.id);
                                    return (
                                        <tr key={index} className="border-b last:border-b-0">
                                            <td className="p-2">{material.name}</td>
                                            <td className="p-2">{item.quantity_per_unit} {material.unit}</td>
                                            <td className={cn("p-2 font-semibold", onHand <= (material.low_stock_threshold || 0) ? 'text-red-500' : 'text-green-600')}>{onHand.toFixed(2)} {material.unit}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                         <div className="mt-4 border-t pt-4">
                             <Button type="button" variant="outline" onClick={handleGenerateOP} disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                Gerar OP de Teste (1 un.)
                            </Button>
                        </div>
                    </div>
                </Section>
            </div>
        </div>
    );
};

const ProductPersonalizationPanel: React.FC<{product: Product | null}> = ({ product }) => {
    return (
        <div>
            <Section title="Pré-visualização da Personalização">
                <div className="flex items-center justify-center bg-secondary min-h-[200px] rounded-lg">
                    <p className="text-textSecondary">Visualizador 3D em desenvolvimento.</p>
                </div>
            </Section>
        </div>
    )
}

export default ProductDrawer;