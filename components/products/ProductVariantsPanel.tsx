import React, { useState } from 'react';
import { Product, ProductVariant, AppData } from '../../types';
import { Button } from '../ui/Button';
import { Plus, Loader2 } from 'lucide-react';
import { dataService } from '../../services/dataService';
import ProductVariantsTable from './ProductVariantsTable';
import VariantGeneratorDialog from './VariantGeneratorDialog';
import { toast } from '../../hooks/use-toast';

interface ProductVariantsPanelProps {
    product: Product;
    allVariants: ProductVariant[];
    appData: AppData;
    isLoading: boolean;
    onRefresh: () => void;
}

const ProductVariantsPanel: React.FC<ProductVariantsPanelProps> = ({ product, allVariants, appData, isLoading, onRefresh }) => {
    const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const productVariants = allVariants.filter(v => v.product_base_id === product.id);

    const handleVariantsGenerated = async (newVariants: Omit<ProductVariant, 'id'>[]) => {
        setIsSubmitting(true);
        try {
            await dataService.addManyDocuments('product_variants', newVariants);
            toast({ title: "Sucesso!", description: `${newVariants.length} novas variantes foram geradas.` });
            setIsGeneratorOpen(false);
            onRefresh(); // Refresh parent data
        } catch(error) {
            toast({ title: "Erro", description: "Não foi possível salvar as novas variantes.", variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-textSecondary">Gerencie e gere todas as combinações (SKUs) para este produto base.</p>
                <Button onClick={() => setIsGeneratorOpen(true)} disabled={!product || isSubmitting}>
                    {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Plus className="w-4 h-4 mr-2" />}
                    Gerar Variantes Válidas
                </Button>
            </div>
            
            {isLoading ? (
                <div className="flex justify-center items-center h-48">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : (
                <ProductVariantsTable variants={productVariants} />
            )}
           
            <VariantGeneratorDialog
                isOpen={isGeneratorOpen}
                onClose={() => setIsGeneratorOpen(false)}
                product={product}
                appData={appData}
                onGenerate={handleVariantsGenerated}
            />
        </div>
    );
};

export default ProductVariantsPanel;