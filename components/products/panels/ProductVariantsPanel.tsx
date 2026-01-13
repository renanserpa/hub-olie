import React, { useState, useMemo } from 'react';
import { Product, ProductVariant, AppData, ProductPart } from '../../../types';
import { Button } from '../../ui/Button';
import { Plus, Loader2 } from 'lucide-react';
import { dataService } from '../../../services/dataService';
import { toast } from '../../../hooks/use-toast';
import ProductVariantsTable from '../ProductVariantsTable';
import Modal from '../../ui/Modal';

const getOptionsForSource = (source: ProductPart['options_source'] | undefined, appData: AppData): { value: string, label: string }[] => {
    if (!source || !appData) return [];
    const mapping: Record<string, any[]> = {
        'fabric_colors': appData.catalogs.cores_texturas.tecido,
        'zipper_colors': appData.catalogs.cores_texturas.ziper,
        'lining_colors': appData.catalogs.cores_texturas.forro,
        'puller_colors': appData.catalogs.cores_texturas.puxador,
        'bias_colors': appData.catalogs.cores_texturas.vies,
        'embroidery_colors': appData.catalogs.cores_texturas.bordado,
        'config_materials': appData.config_materials,
    };
    const result = mapping[source] || [];
    return result.map(item => ({ value: item.id, label: item.name }));
};


const VariantGeneratorDialog: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onGenerate: () => Promise<void>;
    isGenerating: boolean;
    product: Product;
    appData: AppData;
}> = ({ isOpen, onClose, onGenerate, isGenerating, product, appData }) => {

    const potentialVariantCount = useMemo(() => {
        if (!product) return 0;
        
        let count = 1;
        if (product.configurable_parts) {
             for (const part of product.configurable_parts) {
                const options = getOptionsForSource(part.options_source, appData);
                if (options.length > 0) {
                    count *= options.length;
                }
            }
        }
        if (product.available_sizes && product.available_sizes.length > 0) {
            count = count === 1 && product.available_sizes.length > 0 ? product.available_sizes.length : count * product.available_sizes.length;
        }

        return count === 1 ? 0 : count;

    }, [product, appData]);

    const handleConfirm = async () => {
        await onGenerate();
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Gerar Variantes de Produto">
            <div className="space-y-4">
                <p className="text-sm text-textSecondary">
                    Esta ação irá <strong className="text-red-600">apagar todas as variantes existentes</strong> para este produto e criar novas com base nas configurações atuais de tamanhos, partes configuráveis e regras de combinação.
                </p>
                <div className="p-3 bg-secondary rounded-lg text-sm">
                    <p>Partes configuráveis: <strong>{product.configurable_parts?.length || 0}</strong></p>
                    <p>Tamanhos definidos: <strong>{product.available_sizes?.length || 0}</strong></p>
                    <p className="font-bold mt-2">Total de combinações possíveis: <span className="text-primary text-base">{potentialVariantCount}</span></p>
                    <p className="text-xs text-textSecondary">(Este número pode ser menor após a aplicação das regras de combinação).</p>
                </div>

                {potentialVariantCount > 100 && 
                    <p className="text-sm font-semibold text-red-500 p-2 bg-red-500/10 rounded-md">
                        Aviso: Um número alto de variantes pode impactar a performance. Continue com cuidado.
                    </p>
                }

                <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={onClose} disabled={isGenerating}>Cancelar</Button>
                    <Button type="button" onClick={handleConfirm} disabled={isGenerating}>
                        {isGenerating && <Loader2 className="w-4 h-4 mr-2 animate-spin"/>}
                        Apagar e Gerar Novas Variantes
                    </Button>
                </div>
            </div>
        </Modal>
    );
}

interface ProductVariantsPanelProps {
    product: Product;
    allVariants: ProductVariant[];
    appData: AppData;
    onRefresh: () => void;
    generateVariantsForProduct: (product: Product, appData: AppData) => Promise<void>;
    isGenerating: boolean;
}


const ProductVariantsPanel: React.FC<ProductVariantsPanelProps> = ({ 
    product, allVariants, appData, onRefresh, generateVariantsForProduct, isGenerating 
}) => {
    const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
    
    const productVariants = allVariants.filter(v => v.product_base_id === product.id);
    
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-sm text-textSecondary">Gerencie e gere todas as combinações (SKUs) para este produto base.</p>
                <Button onClick={() => setIsGeneratorOpen(true)} disabled={!product || isGenerating}>
                    <Plus className="w-4 h-4 mr-2" />
                    Gerar Novas Variações
                </Button>
            </div>

            <VariantGeneratorDialog
                isOpen={isGeneratorOpen}
                onClose={() => setIsGeneratorOpen(false)}
                onGenerate={() => generateVariantsForProduct(product, appData)}
                isGenerating={isGenerating}
                product={product}
                appData={appData}
            />
            
            <ProductVariantsTable variants={productVariants} />
        </div>
    );
};

export default ProductVariantsPanel;