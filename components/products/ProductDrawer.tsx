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
        const saveFirstMessage = <p className="text-center text-sm text-textSecondary p-8">Salve o produto base primeiro para poder acessar esta aba.</p>;

        switch(activeTab) {
            case 'base':
                return <ProductBasePanel formData={formData} setFormData={setFormData} categories={categories} appData={appData} />;
            case 'skus':
                 return product ? <ProductVariantsPanel product={product} allVariants={allVariants} appData={appData} onRefresh={onRefresh} /> : saveFirstMessage;
            case 'bom':
                return product ? <ProductBOMPanel product={product} allVariants={allVariants} appData={appData} inventoryBalances={inventoryBalances} /> : saveFirstMessage;
            case 'personalization':
                return product ? <ProductPersonalizationPanel product={product} appData={appData} formData={formData} setFormData={setFormData} /> : saveFirstMessage;
            default:
                return null;
        }
    }

    return (
        <div 
            className={cn(
                "fixed inset-0 bg