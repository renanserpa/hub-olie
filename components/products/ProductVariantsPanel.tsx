import React, { useState, useEffect } from 'react';
import { Product, ProductVariant, AppData } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Plus, GitFork, Loader2, Package } from 'lucide-react';
import { dataService } from '../../services/dataService';
import ProductVariantsTable from './ProductVariantsTable';
import VariantGeneratorDialog from './VariantGeneratorDialog';
import { toast } from '../../hooks/use-toast';

interface ProductVariantsPanelProps {
    productId: string | null;
}

const ProductVariantsPanel: React.FC<ProductVariantsPanelProps> = ({ productId }) => {
    const [product, setProduct] = useState<Product | null>(null);
    const [variants, setVariants] = useState<ProductVariant[]>([]);
    const [appData, setAppData] = useState<AppData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);

    const fetchData = async () => {
        if (!productId) {
            setVariants([]);
            setProduct(null);
            return;
        }
        setIsLoading(true);
        try {
            const [productData, allVariants, settingsData] = await Promise.all([
                dataService.getDocument<Product>('products', productId),
                dataService.getCollection<ProductVariant>('product_variants'),
                dataService.getSettings()
            ]);
            setProduct(productData);
            setVariants(allVariants.filter(v => v.product_base_id === productId));
            setAppData(settingsData);
        } catch (error) {
            console.error("Failed to fetch variants data", error);
            toast({ title: "Erro", description: "Não foi possível carregar os dados das variantes.", variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [productId]);
    
    const handleVariantsGenerated = async (newVariants: Omit<ProductVariant, 'id'>[]) => {
        setIsLoading(true);
        try {
            // FIX: Use addManyDocuments for bulk creation
            await dataService.addManyDocuments('product_variants', newVariants);
            toast({ title: "Sucesso!", description: `${newVariants.length} novas variantes foram geradas.` });
            setIsGeneratorOpen(false);
            await fetchData(); // Refresh data
        } catch(error) {
            toast({ title: "Erro", description: "Não foi possível salvar as novas variantes.", variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };

    if (!productId) {
        return (
            <div className="text-center text-textSecondary py-16 border-2 border-dashed border-border rounded-xl">
                <Package className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-textPrimary">Selecione um Produto Base</h3>
                <p className="mt-1 text-sm">Clique em um item na aba "Produtos Base" para visualizar e gerenciar suas variantes aqui.</p>
            </div>
        );
    }
    
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <GitFork size={18} />
                        Variantes de: {product?.name || '...'}
                    </CardTitle>
                    <p className="text-sm text-textSecondary mt-1">Todas as combinações únicas (SKUs) para o produto selecionado.</p>
                </div>
                <Button onClick={() => setIsGeneratorOpen(true)} disabled={!product}>
                    <Plus className="w-4 h-4 mr-2" />
                    Gerar Novas Variantes
                </Button>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex justify-center items-center h-48">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <ProductVariantsTable variants={variants} />
                )}
            </CardContent>
            {product && appData && (
                <VariantGeneratorDialog
                    isOpen={isGeneratorOpen}
                    onClose={() => setIsGeneratorOpen(false)}
                    product={product}
                    appData={appData}
                    onGenerate={handleVariantsGenerated}
                />
            )}
        </Card>
    );
};

export default ProductVariantsPanel;