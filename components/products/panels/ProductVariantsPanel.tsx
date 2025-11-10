import React, { useState } from 'react';
import { Product, ProductVariant, AppData } from '../../../types';
import { Button } from '../../ui/Button';
import { Plus, Loader2 } from 'lucide-react';
import { dataService } from '../../../services/dataService';
import { toast } from '../../../hooks/use-toast';
import ProductVariantsTable from '../ProductVariantsTable';

// Mock Variant Generator Dialog (inline for simplicity)
const VariantGenerator: React.FC<{
    product: Product;
    appData: AppData;
    onGenerate: (variants: Omit<ProductVariant, 'id'>[]) => Promise<void>;
}> = ({ product, appData, onGenerate }) => {
    // A simplified generator for demonstration
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = async () => {
        setIsGenerating(true);
        // This is a very basic generation logic. The real one would be more complex.
        const size = product.available_sizes?.[0];
        const fabric = appData.catalogs.cores_texturas.tecido[0];

        if (!size || !fabric) {
            toast({ title: "Faltam Opções", description: "Defina tamanhos e cores de tecido para gerar variantes.", variant: "destructive"});
            setIsGenerating(false);
            return;
        }

        const newVariant: Omit<ProductVariant, 'id'> = {
            product_base_id: product.id,
            sku: `${product.base_sku}-${size.name}-${fabric.name.slice(0,3).toUpperCase()}`,
            name: `${product.name} ${size.name} - ${fabric.name}`,
            configuration: { size: size.name, fabric: fabric.name },
            price_modifier: 0,
            final_price: product.base_price,
            bom: product.base_bom || [],
        };

        await onGenerate([newVariant]);
        setIsGenerating(false);
    };

    return (
        <div className="p-4 border-dashed border-2 rounded-lg bg-secondary/50">
            <h4 className="font-semibold text-lg mb-2">Gerador de Combinações</h4>
            <p className="text-sm text-textSecondary mb-4">Em desenvolvimento. O gerador completo terá um grid interativo para selecionar e validar combinações em tempo real. Por enquanto, a geração é simplificada.</p>
            <Button onClick={handleGenerate} disabled={isGenerating}>
                {isGenerating && <Loader2 className="w-4 h-4 mr-2 animate-spin"/>}
                Gerar Variante de Teste
            </Button>
        </div>
    );
};


const ProductVariantsPanel: React.FC<{
    product: Product;
    allVariants: ProductVariant[];
    appData: AppData;
    onRefresh: () => void;
}> = ({ product, allVariants, appData, onRefresh }) => {
    const [showGenerator, setShowGenerator] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const productVariants = allVariants.filter(v => v.product_base_id === product.id);

    const handleVariantsGenerated = async (newVariants: Omit<ProductVariant, 'id'>[]) => {
        setIsSubmitting(true);
        try {
            await dataService.addManyDocuments('product_variants', newVariants);
            toast({ title: "Sucesso!", description: `${newVariants.length} nova(s) variante(s) foram geradas.` });
            setShowGenerator(false);
            onRefresh();
        } catch(error) {
            toast({ title: "Erro", description: "Não foi possível salvar as novas variantes.", variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-sm text-textSecondary">Gerencie e gere todas as combinações (SKUs) para este produto base.</p>
                <Button onClick={() => setShowGenerator(true)} disabled={!product || isSubmitting}>
                    <Plus className="w-4 h-4 mr-2" />
                    Gerar Novas Combinações
                </Button>
            </div>

            {showGenerator && (
                <VariantGenerator product={product} appData={appData} onGenerate={handleVariantsGenerated} />
            )}
            
            <ProductVariantsTable variants={productVariants} />
        </div>
    );
};

export default ProductVariantsPanel;