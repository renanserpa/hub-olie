import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Product, ProductCategory, AnyProduct, AppData, ProductVariant, InventoryBalance } from '../../types';
import { Loader2, Package, GitBranch, List, Settings, X } from 'lucide-react';
import TabLayout from '../ui/TabLayout';
import { cn } from '../../lib/utils';
import { toast } from '../../hooks/use-toast';
import { productSchema } from '../../lib/schemas/product';
import ProductBasePanel from './panels/ProductBasePanel';
import ProductVariantsPanel from './panels/ProductVariantsPanel';
import ProductBOMPanel from './panels/ProductBOMPanel';
import ProductPersonalizationPanel from './panels/ProductPersonalizationPanel';

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
        const productForPanels = product || { ...formData, id: 'new' } as Product;

        switch(activeTab) {
            case 'base':
                return <ProductBasePanel formData={formData} setFormData={setFormData} categories={categories} appData={appData} />;
            case 'skus':
                 return product ? <ProductVariantsPanel product={product} allVariants={allVariants} appData={appData} onRefresh={onRefresh} /> : <p className="text-center text-sm text-textSecondary p-8">Salve o produto base primeiro para poder gerar variantes.</p>;
            case 'bom':
                return <ProductBOMPanel product={productForPanels} allVariants={allVariants} appData={appData} inventoryBalances={inventoryBalances} />;
            case 'personalization':
                return <ProductPersonalizationPanel product={productForPanels} appData={appData} />;
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

export default ProductDrawer;