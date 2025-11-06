import React, { useState, useEffect } from 'react';
import { Product, AppData, ProductPart, ProductVariant, BOMComponent } from '../../types';
import Modal from '../ui/Modal';
import { Button } from '../ui/Button';
import { toast } from '../../hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface VariantGeneratorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  appData: AppData;
  onGenerate: (variants: Omit<ProductVariant, 'id'>[]) => Promise<void>;
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
    return (mapping[source] || []).map(item => ({ id: item.id, name: item.name }));
};

const VariantGeneratorDialog: React.FC<VariantGeneratorDialogProps> = ({ isOpen, onClose, product, appData, onGenerate }) => {
    const [selections, setSelections] = useState<Record<string, string[]>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const initialSelections: Record<string, string[]> = {};
            if (product.available_sizes) {
                initialSelections['size'] = product.available_sizes.map(s => s.id);
            }
            product.configurable_parts?.forEach(part => {
                initialSelections[part.key] = getOptionsForSource(part.options_source, appData).map(opt => opt.id);
            });
            setSelections(initialSelections);
        }
    }, [isOpen, product, appData]);

    const handleSelectionChange = (key: string, optionId: string) => {
        setSelections(prev => {
            const current = prev[key] || [];
            const newSelection = current.includes(optionId) ? current.filter(id => id !== optionId) : [...current, optionId];
            return { ...prev, [key]: newSelection };
        });
    };

    const generateCombinations = () => {
        const keys = Object.keys(selections).filter(key => selections[key].length > 0);
        if (keys.length === 0) return [];

        let combinations: Record<string, string>[] = [{}];
        
        for (const key of keys) {
            const options = selections[key];
            const tempCombinations: Record<string, string>[] = [];
            for (const combo of combinations) {
                for (const option of options) {
                    tempCombinations.push({ ...combo, [key]: option });
                }
            }
            combinations = tempCombinations;
        }
        return combinations;
    };

    const handleGenerate = async () => {
        setIsSubmitting(true);
        const combinations = generateCombinations();
        if (combinations.length === 0) {
            toast({ title: "Atenção", description: "Selecione ao menos uma opção para gerar variantes.", variant: "destructive" });
            setIsSubmitting(false);
            return;
        }

        const newVariants: Omit<ProductVariant, 'id'>[] = combinations.map(config => {
            const skuParts: string[] = [product.base_sku];
            const nameParts: string[] = [];
            
            const sizeId = config['size'];
            if (sizeId) {
                const size = product.available_sizes?.find(s => s.id === sizeId);
                if(size) {
                    skuParts.push(size.name);
                    nameParts.push(size.name);
                }
            }

            product.configurable_parts?.forEach(part => {
                const optionId = config[part.key];
                if (optionId) {
                    const options = getOptionsForSource(part.options_source, appData);
                    const option = options.find(o => o.id === optionId);
                    if (option) {
                        skuParts.push(option.name.substring(0,3).toUpperCase());
                        nameParts.push(option.name);
                    }
                }
            });

            return {
                product_base_id: product.id,
                sku: skuParts.join('-'),
                name: `${product.name} - ${nameParts.join(' / ')}`,
                configuration: config,
                price_modifier: 0,
                final_price: product.base_price,
                bom: product.base_bom || [],
            };
        });

        await onGenerate(newVariants);
        setIsSubmitting(false);
    };

    const allParts = [
        ...(product.available_sizes && product.available_sizes.length > 0 ? [{ key: 'size', name: 'Tamanhos', options: product.available_sizes }] : []),
        ...(product.configurable_parts?.map(part => ({
            key: part.key,
            name: part.name,
            options: getOptionsForSource(part.options_source, appData)
        })) || [])
    ];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Gerar Variantes para: ${product.name}`} className="max-w-2xl">
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                <p className="text-sm text-textSecondary">Selecione as opções que você deseja combinar para criar os SKUs de venda.</p>
                {allParts.map(part => (
                    <div key={part.key}>
                        <h4 className="font-semibold text-sm mb-2">{part.name}</h4>
                        <div className="flex flex-wrap gap-2">
                            {part.options.map(opt => (
                                <label key={opt.id} className="flex items-center gap-2 px-3 py-1.5 border rounded-full text-sm cursor-pointer transition-colors has-[:checked]:bg-primary/10 has-[:checked]:border-primary/50">
                                    <input
                                        type="checkbox"
                                        checked={(selections[part.key] || []).includes(opt.id)}
                                        onChange={() => handleSelectionChange(part.key, opt.id)}
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    {opt.name}
                                </label>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
             <div className="mt-6 flex justify-between items-center pt-4 border-t">
                <p className="text-sm font-bold text-primary">{generateCombinations().length} variantes serão geradas.</p>
                <div className="flex gap-3">
                    <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
                    <Button type="button" onClick={handleGenerate} disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Gerar e Salvar
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default VariantGeneratorDialog;