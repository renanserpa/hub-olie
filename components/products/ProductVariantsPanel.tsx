import React, { useState, useEffect } from 'react';
import { Product, ProductVariant } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Plus, GitFork, Loader2, Package } from 'lucide-react';
import { dataService } from '../../services/dataService';
import ProductVariantsTable from './ProductVariantsTable';
import VariantGeneratorDialog from './VariantGeneratorDialog';

interface ProductVariantsPanelProps {
    productId: string | null;
}

const ProductVariantsPanel: React.FC<ProductVariantsPanelProps> = ({ productId }) => {
    const [variants, setVariants] = useState<ProductVariant[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);

    useEffect(() => {
        if (!productId) {
            setVariants([]);
            return;
        }

        const fetchVariants = async () => {
            setIsLoading(true);
            try {
                const allVariants = await dataService.getCollection<ProductVariant>('product_variants');
                setVariants(allVariants.filter(v => v.product_base_id === productId));
            } catch (error) {
                console.error("Failed to fetch variants", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchVariants();
    }, [productId]);

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
                        Variantes Geradas (SKUs)
                    </CardTitle>
                    <p className="text-sm text-textSecondary mt-1">Todas as combinações únicas para o produto selecionado.</p>
                </div>
                <Button onClick={() => setIsGeneratorOpen(true)}>
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
            <VariantGeneratorDialog
                isOpen={isGeneratorOpen}
                onClose={() => setIsGeneratorOpen(false)}
            />
        </Card>
    );
};

export default ProductVariantsPanel;